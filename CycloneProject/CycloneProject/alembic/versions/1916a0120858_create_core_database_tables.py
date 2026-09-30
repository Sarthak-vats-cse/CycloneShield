"""create core database tables

Revision ID: 1916a0120858
Revises:
Create Date: 2026-09-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = "1916a0120858"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create application database tables."""

    # ---------------------------------------------------------
    # Cyclones
    # ---------------------------------------------------------

    op.create_table(
        "cyclones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cyclone_id", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("wind_speed", sa.Float(), nullable=True),
        sa.Column("pressure", sa.Float(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "observed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("cyclone_id"),
    )

    op.create_index(
        "ix_cyclones_id",
        "cyclones",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_cyclones_cyclone_id",
        "cyclones",
        ["cyclone_id"],
        unique=True,
    )

    # ---------------------------------------------------------
    # Infrastructure assets
    # ---------------------------------------------------------

    op.create_table(
        "infrastructure_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("asset_type", sa.String(length=50), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "location",
            geoalchemy2.types.Geometry(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                from_text="ST_GeomFromEWKT",
                name="geometry",
            ),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_id"),
    )

    op.create_index(
        "ix_infrastructure_assets_id",
        "infrastructure_assets",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_infrastructure_assets_asset_id",
        "infrastructure_assets",
        ["asset_id"],
        unique=True,
    )

    op.create_index(
        "ix_infrastructure_assets_asset_type",
        "infrastructure_assets",
        ["asset_type"],
        unique=False,
    )

    op.create_index(
        "ix_infrastructure_assets_district",
        "infrastructure_assets",
        ["district"],
        unique=False,
    )

    # IMPORTANT:
    # Do NOT explicitly create the PostGIS spatial index here.
    # GeoAlchemy2 creates it automatically because the model
    # uses spatial_index=True.

    # ---------------------------------------------------------
    # Risk zones
    # ---------------------------------------------------------

    op.create_table(
        "risk_zones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cyclone_id", sa.String(length=100), nullable=False),
        sa.Column("risk_level", sa.String(length=30), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("zone_type", sa.String(length=50), nullable=False),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(
                geometry_type="POLYGON",
                srid=4326,
                dimension=2,
                from_text="ST_GeomFromEWKT",
                name="geometry",
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_risk_zones_id",
        "risk_zones",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_risk_zones_cyclone_id",
        "risk_zones",
        ["cyclone_id"],
        unique=False,
    )

    op.create_index(
        "ix_risk_zones_risk_level",
        "risk_zones",
        ["risk_level"],
        unique=False,
    )

    # IMPORTANT:
    # Do NOT explicitly create the PostGIS spatial index here.
    # GeoAlchemy2 creates it automatically because the model
    # uses spatial_index=True.


def downgrade() -> None:
    """Remove application database tables."""

    op.drop_table("risk_zones")
    op.drop_table("infrastructure_assets")
    op.drop_table("cyclones")