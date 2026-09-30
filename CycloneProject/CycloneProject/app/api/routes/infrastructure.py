from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.infrastructure import InfrastructureAsset


router = APIRouter(
    prefix="/infrastructure",
    tags=["Infrastructure"],
)


class InfrastructureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    asset_id: str
    name: str
    asset_type: str
    district: str | None = None
    latitude: float
    longitude: float
    status: str
    created_at: datetime


class InfrastructureCreate(BaseModel):
    asset_id: str
    name: str
    asset_type: str
    district: str | None = None
    latitude: float
    longitude: float
    status: str = "operational"


@router.get("", response_model=list[InfrastructureResponse])
def get_infrastructure(
    type: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    statement = select(InfrastructureAsset).order_by(
        InfrastructureAsset.created_at.desc()
    )

    if type:
        statement = statement.where(
            InfrastructureAsset.asset_type == type
        )

    try:
        return db.scalars(statement).all()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to read infrastructure from the database.",
        ) from exc


@router.post("", response_model=InfrastructureResponse, status_code=201)
def create_infrastructure(
    infrastructure_data: InfrastructureCreate,
    db: Session = Depends(get_db),
):
    infrastructure = InfrastructureAsset(
        asset_id=infrastructure_data.asset_id,
        name=infrastructure_data.name,
        asset_type=infrastructure_data.asset_type,
        district=infrastructure_data.district,
        latitude=infrastructure_data.latitude,
        longitude=infrastructure_data.longitude,
        status=infrastructure_data.status,
        created_at=datetime.now(timezone.utc),
    )

    try:
        db.add(infrastructure)
        db.commit()
        db.refresh(infrastructure)

        return infrastructure

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                f"Infrastructure asset with asset_id "
                f"'{infrastructure_data.asset_id}' already exists."
            ),
        ) from exc

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save infrastructure to the database.",
        ) from exc