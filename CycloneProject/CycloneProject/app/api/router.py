
from fastapi import APIRouter

from app.api.routes import cyclone, infrastructure, risk, data

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(cyclone.router)
api_router.include_router(infrastructure.router)
api_router.include_router(risk.router)
api_router.include_router(data.router)