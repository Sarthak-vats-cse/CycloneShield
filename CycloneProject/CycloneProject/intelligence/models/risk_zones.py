def calculate_risk_zone(distance_km):
    """
    Classify an area based on its distance from the cyclone center.
    This is a prototype zone model and should later be refined
    using wind, rainfall, storm surge, and geographic data.
    """

    if distance_km <= 50:
        return {
            "zone": "CRITICAL",
            "risk_score": 90
        }

    elif distance_km <= 100:
        return {
            "zone": "HIGH",
            "risk_score": 70
        }

    elif distance_km <= 150:
        return {
            "zone": "MODERATE",
            "risk_score": 45
        }

    else:
        return {
            "zone": "LOW",
            "risk_score": 20
        }
if __name__ == "__main__":

    test_distances = [30, 75, 125, 200]

    for distance in test_distances:

        result = calculate_risk_zone(distance)

        print(
            f"{distance} km → "
            f"{result['zone']} "
            f"({result['risk_score']}/100)"
        )    