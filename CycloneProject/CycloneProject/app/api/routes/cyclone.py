from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.cyclone import Cyclone


router = APIRouter(
    prefix="/cyclones",
    tags=["Cyclones"],
)


class CycloneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cyclone_id: str
    name: str
    category: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    wind_speed: float | None = None
    pressure: float | None = None
    description: str | None = None
    observed_at: datetime | None = None
    created_at: datetime


class CycloneCreate(BaseModel):
    cyclone_id: str
    name: str
    category: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    wind_speed: float | None = None
    pressure: float | None = None
    description: str | None = None
    observed_at: datetime | None = None


@router.get("", response_model=list[CycloneResponse])
def get_cyclones(
    db: Session = Depends(get_db),
):
    statement = select(Cyclone).order_by(Cyclone.created_at.desc())

    try:
        return db.scalars(statement).all()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to read cyclones from the database.",
        ) from exc


@router.post("", response_model=CycloneResponse, status_code=201)
def create_cyclone(
    cyclone_data: CycloneCreate,
    db: Session = Depends(get_db),
):
    cyclone = Cyclone(
        cyclone_id=cyclone_data.cyclone_id,
        name=cyclone_data.name,
        category=cyclone_data.category,
        latitude=cyclone_data.latitude,
        longitude=cyclone_data.longitude,
        wind_speed=cyclone_data.wind_speed,
        pressure=cyclone_data.pressure,
        description=cyclone_data.description,
        observed_at=cyclone_data.observed_at,
        created_at=datetime.now(timezone.utc),
    )

    try:
        db.add(cyclone)
        db.commit()
        db.refresh(cyclone)

        return cyclone

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                f"Cyclone with cyclone_id "
                f"'{cyclone_data.cyclone_id}' already exists."
            ),
        ) from exc

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save cyclone to the database.",
        ) from exc