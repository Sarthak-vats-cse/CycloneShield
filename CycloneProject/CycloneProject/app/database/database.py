import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# Load environment variables from .env
load_dotenv()


# ---------------------------------------------------------
# Database configuration
# ---------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")


# ---------------------------------------------------------
# SQLAlchemy engine
# ---------------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# ---------------------------------------------------------
# Database session
# ---------------------------------------------------------

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------
# SQLAlchemy base
# ---------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------
# FastAPI database dependency
# ---------------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# Database health check
# ---------------------------------------------------------

def test_database_connection():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return result.scalar() == 1


# ---------------------------------------------------------
# Import models
# ---------------------------------------------------------
# These imports make sure SQLAlchemy metadata knows about
# all application tables when Alembic loads Base.metadata.
# ---------------------------------------------------------

from app.models import (  # noqa: E402, F401
    Cyclone,
    InfrastructureAsset,
    RiskZone,
)