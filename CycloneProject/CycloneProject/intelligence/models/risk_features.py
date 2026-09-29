def wind_risk(wind_speed_kmh):
    """
    Convert wind speed into a 0-100 risk score.
    """

    if wind_speed_kmh < 60:
        return 10
    elif wind_speed_kmh < 90:
        return 30
    elif wind_speed_kmh < 120:
        return 50
    elif wind_speed_kmh < 150:
        return 75
    else:
        return 95


def rainfall_risk(rainfall_mm):
    """
    Convert rainfall amount into a 0-100 risk score.
    """

    if rainfall_mm < 50:
        return 10
    elif rainfall_mm < 100:
        return 30
    elif rainfall_mm < 150:
        return 50
    elif rainfall_mm < 200:
        return 75
    else:
        return 95


def storm_surge_risk(storm_surge_m):
    """
    Convert storm surge height into a 0-100 risk score.
    """

    if storm_surge_m < 0.5:
        return 10
    elif storm_surge_m < 1.0:
        return 30
    elif storm_surge_m < 1.5:
        return 50
    elif storm_surge_m < 2.5:
        return 75
    else:
        return 95


def calculate_features(
    wind_speed_kmh,
    rainfall_mm,
    storm_surge_m,
    elevation_risk,
    infrastructure_exposure
):
    """
    Convert raw cyclone measurements into normalized
    risk features for the risk engine.
    """

    return {
        "wind_risk": wind_risk(wind_speed_kmh),
        "rainfall_risk": rainfall_risk(rainfall_mm),
        "storm_surge_risk": storm_surge_risk(storm_surge_m),
        "elevation_risk": elevation_risk,
        "infrastructure_exposure": infrastructure_exposure
    }