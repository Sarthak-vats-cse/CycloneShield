from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    asset_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    asset_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="operational",
    )

    location = mapped_column(
        Geometry(
            geometry_type="POINT",
            srid=4326,
            spatial_index=True,
        ),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )