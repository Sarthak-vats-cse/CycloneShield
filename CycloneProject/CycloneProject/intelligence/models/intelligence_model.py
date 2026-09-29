from .intelligence_output import IntelligenceOutput
from ..risk_engine import calculate_mcda_risk, risk_level


def build_intelligence(
    max_wind_speed,
    rainfall_72h,
    elevation_mean,
    hospital_count,
    power_substation_count,
    builtup_pct,
    dataset_stats,
    forecast_track,
    risk_zones,
    infrastructure_exposure,
    ai_advisory=""
):
    """
    Main Cyclone Intelligence Model.

    Combines:
    1. MCDA risk calculation
    2. Hazard information
    3. Forecast track
    4. Risk zones
    5. Infrastructure exposure
    6. AI advisory

    Returns:
        IntelligenceOutput
    """

    # ==========================================
    # 1. CALCULATE RISK
    # ==========================================

    score = calculate_mcda_risk(
        max_wind_speed=max_wind_speed,
        rainfall_72h=rainfall_72h,
        elevation_mean=elevation_mean,
        hospital_count=hospital_count,
        power_substation_count=power_substation_count,
        builtup_pct=builtup_pct,
        dataset_stats=dataset_stats
    )

    level = risk_level(score)

    # ==========================================
    # 2. BUILD HAZARD INFORMATION
    # ==========================================

    hazards = {
        "model_wind_kmh": round(
            max_wind_speed * 1.852, 2
        ),

        "model_wind_knots": max_wind_speed,

        "rainfall_72h_mm": rainfall_72h,

        "elevation_m": elevation_mean,

        "builtup_pct": builtup_pct,

        "hospitals_exposed": hospital_count,

        "power_substations_exposed": power_substation_count
    }

    # ==========================================
    # 3. CREATE FINAL INTELLIGENCE OUTPUT
    # ==========================================

    intelligence = IntelligenceOutput(
        risk_score=score,
        risk_level=level,
        hazards=hazards,
        forecast_track=forecast_track,
        risk_zones=risk_zones,
        infrastructure_exposure=infrastructure_exposure,
        ai_advisory=ai_advisory
    )

    return intelligence