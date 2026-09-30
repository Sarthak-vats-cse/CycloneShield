
import json
from datetime import datetime, timezone
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.elements import WKTElement
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.risk import RiskZone

from intelligence.risk_engine import calculate_mcda_risk, risk_level
from intelligence.data.dataset_stats import load_dataset_stats


router = APIRouter(
    prefix="/risk",
    tags=["Risk"],
)


class RiskAnalysisRequest(BaseModel):
    cyclone_id: str | None = None
    cell_id: str | None = None

    max_wind_speed: float = Field(ge=0)
    rainfall_72h: float = Field(ge=0)
    elevation_mean: float = Field(ge=0)
    hospital_count: int = Field(ge=0)
    power_substation_count: int = Field(ge=0)
    builtup_pct: float = Field(ge=0, le=1)


class RiskZoneCreate(BaseModel):
    cyclone_id: str
    risk_level: str
    risk_score: float = Field(ge=0.0, le=1.0)
    zone_type: str
    coordinates: list[list[float]]


@lru_cache(maxsize=1)
def get_cached_dataset_stats():
    """Load dataset statistics once and reuse them."""
    return load_dataset_stats()


@router.post("/analyze")
def analyze_risk(request: RiskAnalysisRequest):
    """
    Calculate risk using the team's MCDA risk engine.
    """

    try:
        stats = get_cached_dataset_stats()

        score = calculate_mcda_risk(
            max_wind_speed=request.max_wind_speed,
            rainfall_72h=request.rainfall_72h,
            elevation_mean=request.elevation_mean,
            hospital_count=request.hospital_count,
            power_substation_count=request.power_substation_count,
            builtup_pct=request.builtup_pct,
            dataset_stats=stats,
        )

        # Keep the public API score within the 0–1 range.
        score = max(0.0, min(1.0, float(score)))

        return {
            "status": "success",
            "cyclone_id": request.cyclone_id,
            "cell_id": request.cell_id,
            "risk_score": score,
            "risk_level": risk_level(score),
            "method": "MCDA",
        }

    except (FileNotFoundError, ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Risk dataset or configuration error: {exc}",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Risk analysis failed.",
        ) from exc


@router.post("/zones", status_code=201)
def create_risk_zone(
    zone_data: RiskZoneCreate,
    db: Session = Depends(get_db),
):
    if len(zone_data.coordinates) < 4:
        raise HTTPException(
            status_code=422,
            detail="A polygon requires at least four coordinate pairs.",
        )

    first_point = zone_data.coordinates[0]
    last_point = zone_data.coordinates[-1]

    if first_point != last_point:
        raise HTTPException(
            status_code=422,
            detail="Polygon coordinates must be closed.",
        )

    for point in zone_data.coordinates:
        if len(point) != 2:
            raise HTTPException(
                status_code=422,
                detail="Each coordinate must contain [longitude, latitude].",
            )

        longitude, latitude = point

        if not -180 <= longitude <= 180:
            raise HTTPException(
                status_code=422,
                detail="Longitude must be between -180 and 180.",
            )

        if not -90 <= latitude <= 90:
            raise HTTPException(
                status_code=422,
                detail="Latitude must be between -90 and 90.",
            )

    coordinate_text = ", ".join(
        f"{longitude} {latitude}"
        for longitude, latitude in zone_data.coordinates
    )

    polygon_wkt = f"POLYGON(({coordinate_text}))"

    risk_zone = RiskZone(
        cyclone_id=zone_data.cyclone_id,
        risk_level=zone_data.risk_level,
        risk_score=zone_data.risk_score,
        zone_type=zone_data.zone_type,
        geometry=WKTElement(
            polygon_wkt,
            srid=4326,
        ),
        created_at=datetime.now(timezone.utc),
    )

    try:
        db.add(risk_zone)
        db.commit()
        db.refresh(risk_zone)

        return {
            "id": risk_zone.id,
            "cyclone_id": risk_zone.cyclone_id,
            "risk_level": risk_zone.risk_level,
            "risk_score": risk_zone.risk_score,
            "zone_type": risk_zone.zone_type,
            "created_at": risk_zone.created_at,
        }

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Risk zone could not be saved because of a database constraint.",
        ) from exc

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save risk zone to PostGIS.",
        ) from exc


@router.get("/zones")
def get_risk_zones(
    db: Session = Depends(get_db),
):
    statement = select(
        RiskZone.id,
        RiskZone.cyclone_id,
        RiskZone.risk_level,
        RiskZone.risk_score,
        RiskZone.zone_type,
        RiskZone.created_at,
        func.ST_AsGeoJSON(RiskZone.geometry).label("geometry"),
    ).order_by(RiskZone.created_at.desc())

    try:
        rows = db.execute(statement).all()

        features = []

        for row in rows:
            geometry = json.loads(row.geometry)

            features.append(
                {
                    "type": "Feature",
                    "id": row.id,
                    "geometry": geometry,
                    "properties": {
                        "cyclone_id": row.cyclone_id,
                        "risk_level": row.risk_level,
                        "risk_score": row.risk_score,
                        "zone_type": row.zone_type,
                        "created_at": (
                            row.created_at.isoformat()
                            if row.created_at
                            else None
                        ),
                    },
                }
            )

        return {
            "type": "FeatureCollection",
            "features": features,
        }

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to read risk zones from PostGIS.",
        ) from exc