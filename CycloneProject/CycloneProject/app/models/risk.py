from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class RiskZone(Base):
    __tablename__ = "risk_zones"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    cyclone_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    risk_level: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    zone_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    geometry = mapped_column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )