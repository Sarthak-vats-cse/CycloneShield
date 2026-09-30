
from pathlib import Path
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/data", tags=["Data"])

DATA_DIR = Path(__file__).resolve().parents[3] / "data"

DATA_FILES = {
    "risk-map": "risk_map.geojson",
    "cyclone-tracks": "cyclone_tracks.geojson",
    "grid": "grid.geojson",
}


@router.get("/{dataset_name}")
def get_dataset(dataset_name: str):
    filename = DATA_FILES.get(dataset_name)

    if filename is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    file_path = DATA_DIR / filename

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Dataset file is missing: {filename}",
        )

    try:
        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
        return JSONResponse(content=data)

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in {filename}",
        ) from exc