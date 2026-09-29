from math import radians, sin, cos, sqrt, atan2


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


def assess_infrastructure_exposure(
    cyclone_lat,
    cyclone_lon,
    infrastructure
):
    """
    Assess infrastructure exposure based on
    distance from the cyclone center.

    This is a prototype intelligence model.
    """

    results = []

    for item in infrastructure:

        distance = calculate_distance(
            cyclone_lat,
            cyclone_lon,
            item["latitude"],
            item["longitude"]
        )

        if distance <= 50:
            risk_level = "CRITICAL"
            risk_score = 90

        elif distance <= 100:
            risk_level = "HIGH"
            risk_score = 70

        elif distance <= 150:
            risk_level = "MODERATE"
            risk_score = 45

        else:
            risk_level = "LOW"
            risk_score = 20

        results.append({
            "id": item["id"],
            "name": item["name"],
            "type": item["type"],
            "latitude": item["latitude"],
            "longitude": item["longitude"],
            "distance_from_cyclone_km": distance,
            "risk_level": risk_level,
            "risk_score": risk_score
        })

    return results

def summarize_infrastructure_exposure(results):
    """
    Organize infrastructure exposure results by infrastructure type.
    """

    power_substations = []
    roads = []
    hospitals = []

    for item in results:

        if item["type"] == "POWER_SUBSTATION":
            power_substations.append(item)

        elif item["type"] == "ROAD":
            roads.append(item)

        elif item["type"] == "HOSPITAL":
            hospitals.append(item)

    return {
        "power_substations": power_substations,
        "roads": roads,
        "hospitals": hospitals
    }

def calculate_infrastructure_counts(results):
    """
    Calculate the number of infrastructure assets
    exposed to HIGH or CRITICAL risk.
    """

    counts = {
        "power_substations_at_risk": 0,
        "roads_at_risk": 0,
        "hospitals_affected": 0
    }

    for item in results:

        if item["risk_level"] not in ["HIGH", "CRITICAL"]:
            continue

        if item["type"] == "POWER_SUBSTATION":
            counts["power_substations_at_risk"] += 1

        elif item["type"] == "ROAD":
            counts["roads_at_risk"] += 1

        elif item["type"] == "HOSPITAL":
            counts["hospitals_affected"] += 1

    return counts