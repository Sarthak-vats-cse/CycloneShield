from dataclasses import dataclass
from typing import List, Dict


@dataclass
class CycloneScenario:
    name: str
    latitude: float
    longitude: float
    wind_speed_kmh: float
    pressure_hpa: float
    movement_direction: str
    forecast: List[Dict]