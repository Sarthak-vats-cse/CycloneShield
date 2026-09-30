
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.database.database import test_database_connection
from app.api.routes import gemini


app = FastAPI(
    title="CycloneShield API",
    description="Cyclone Impact & Infrastructure Vulnerability Forecaster",
    version="0.1.0",
)
app.include_router(gemini.router)

# Allow the local frontend and configured production frontend.
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "cycloneshield-backend",
        "version": "0.1.0",
    }


@app.get("/health/database", tags=["Health"])
def database_health_check():
    database_connected = test_database_connection()

    return {
        "database": "connected" if database_connected else "disconnected",
    }


app.include_router(api_router)