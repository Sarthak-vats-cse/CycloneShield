

def min_max_normalize(value, min_value, max_value):
    """
    Normalize a value to a 0-1 range using min-max normalization.
    """

    return (value - min_value) / (max_value - min_value + 1e-9)


def calculate_mcda_risk(
    max_wind_speed,
    rainfall_72h,
    elevation_mean,
    hospital_count,
    power_substation_count,
    builtup_pct,
    dataset_stats
):
    """
    Calculate cyclone risk using the team's weighted MCDA methodology.

    Risk components:
        30% - Cyclone intensity
        25% - Flood hazard
        20% - Topographic exposure
        15% - Critical infrastructure vulnerability
        10% - Human exposure density

    Final score:
        0.0 - 1.0
    """

    # 1. Cyclone intensity
    wind_norm = min_max_normalize(
        max_wind_speed,
        dataset_stats["max_wind_speed_min"],
        dataset_stats["max_wind_speed_max"]
    )

    # 2. Flood hazard
    rainfall_norm = min_max_normalize(
        rainfall_72h,
        dataset_stats["rainfall_72h_min"],
        dataset_stats["rainfall_72h_max"]
    )

    # 3. Topographic exposure
    inverse_elevation = 1 / (elevation_mean + 1)

    elevation_norm = min_max_normalize(
        inverse_elevation,
        dataset_stats["inverse_elevation_min"],
        dataset_stats["inverse_elevation_max"]
    )

    # 4. Critical infrastructure vulnerability
    infrastructure_exposure = (
        hospital_count + power_substation_count
    )

    infrastructure_norm = min_max_normalize(
        infrastructure_exposure,
        dataset_stats["infrastructure_min"],
        dataset_stats["infrastructure_max"]
    )

    # 5. Human exposure density
    builtup_norm = min_max_normalize(
        builtup_pct,
        dataset_stats["builtup_pct_min"],
        dataset_stats["builtup_pct_max"]
    )

    # Weighted MCDA score
    risk_score = (
        0.30 * wind_norm
        + 0.25 * rainfall_norm
        + 0.20 * elevation_norm
        + 0.15 * infrastructure_norm
        + 0.10 * builtup_norm
    )

    return round(risk_score, 4)


def risk_level(risk_score):
    """
    Convert the 0-1 composite risk score into an
    interpretable risk category.
    """

    if risk_score < 0.20:
        return "LOW"

    elif risk_score < 0.40:
        return "MODERATE"

    elif risk_score < 0.60:
        return "HIGH"

    else:
        return "CRITICAL"

if __name__ == "__main__":
    from data.dataset_stats import load_dataset_stats

    stats = load_dataset_stats()

    score = calculate_mcda_risk(
        max_wind_speed=115,
        rainfall_72h=500,
        elevation_mean=20,
        hospital_count=5,
        power_substation_count=3,
        builtup_pct=0.8,
        dataset_stats=stats
    )

    print("MCDA Cyclone Risk")
    print("-----------------")
    print(f"Risk Score : {score}")
    print(f"Risk Level : {risk_level(score)}")