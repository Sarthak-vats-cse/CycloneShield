from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Cyclone(Base):
    __tablename__ = "cyclones"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    cyclone_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    wind_speed: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    pressure: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    observed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )