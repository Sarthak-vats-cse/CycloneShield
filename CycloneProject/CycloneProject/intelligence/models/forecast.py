from math import radians, sin, cos, sqrt, atan2
from intelligence.models.risk_zones import calculate_risk_zone
from datetime import datetime


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two geographic coordinates.
    Returns distance in kilometers.
    """

    earth_radius = 6371

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return round(earth_radius * c, 2)




def analyze_forecast(current_lat, current_lon, forecast_points):

    results = []

    previous_lat = current_lat
    previous_lon = current_lon
    previous_time = None

    for point in forecast_points:

        distance_from_current = calculate_distance(
            current_lat,
            current_lon,
            point["latitude"],
            point["longitude"]
        )

        distance_from_previous = calculate_distance(
            previous_lat,
            previous_lon,
            point["latitude"],
            point["longitude"]
        )

        current_time = datetime.fromisoformat(
            point["time"].replace("Z", "+00:00")
        )

        movement_speed = None

        if previous_time is not None:

            time_difference_hours = (
                current_time - previous_time
            ).total_seconds() / 3600

            if time_difference_hours > 0:
                movement_speed = round(
                    distance_from_previous / time_difference_hours,
                    2
                )

        zone = calculate_risk_zone(distance_from_current)

        results.append({
        "latitude": point["latitude"],
        "longitude": point["longitude"],
        "time": point["time"],
        "distance_from_current_km": distance_from_current,
        "movement_speed_kmh": movement_speed,
        "risk_zone": zone["zone"],
        "proximity_score": zone["risk_score"]})

        previous_lat = point["latitude"]
        previous_lon = point["longitude"]
        previous_time = current_time

    return results