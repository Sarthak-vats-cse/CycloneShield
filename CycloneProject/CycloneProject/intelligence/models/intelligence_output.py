from dataclasses import dataclass
from typing import Dict, List, Any


@dataclass
class IntelligenceOutput:
    risk_score: float
    risk_level: str
    hazards: Dict[str, Any]
    forecast_track: List[Dict[str, Any]]
    risk_zones: List[Dict[str, Any]]
    infrastructure_exposure: Dict[str, Any]
    ai_advisory: str = ""

    def to_dict(self):
        return {
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "hazards": self.hazards,
            "forecast_track": self.forecast_track,
            "risk_zones": self.risk_zones,
            "infrastructure_exposure": self.infrastructure_exposure,
            "ai_advisory": self.ai_advisory,
        }