from dataclasses import dataclass


@dataclass
class CycloneInput:
    cyclone_name: str
    wind_speed_kmh: float
    rainfall_mm: float
    storm_surge_m: float
    elevation_risk: float
    infrastructure_exposure: float