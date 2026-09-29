def answer_question(question, intelligence):
    """
    Answer cyclone-related questions using the calculated
    IntelligenceOutput.
    """

    question = question.lower().strip()

    hazards = intelligence.hazards
    infrastructure = intelligence.infrastructure_exposure
    forecast = intelligence.forecast_track
    risk_zones = intelligence.risk_zones

    # =====================================================
    # HELPER VALUES
    # =====================================================

    risk_score = float(intelligence.risk_score)
    risk_level = intelligence.risk_level

    wind = float(hazards.get("model_wind_kmh", 0))
    rainfall = float(hazards.get("rainfall_72h_mm", 0))
    elevation = float(hazards.get("elevation_m", 0))
    builtup = float(hazards.get("builtup_pct", 0))

    immediate = infrastructure.get("immediate_50km", {})
    affected = infrastructure.get("affected_100km", {})

    # Find highest-risk forecast point
    highest_forecast = None

    if forecast:
        zone_priority = {
            "LOW": 1,
            "MODERATE": 2,
            "HIGH": 3,
            "CRITICAL": 4
        }

        highest_forecast = max(
            forecast,
            key=lambda x: zone_priority.get(
                str(x.get("risk_zone", "")).upper(),
                0
            )
        )

    # =====================================================
    # DANGER / OVERALL RISK
    # =====================================================

    if (
        "dangerous" in question
        or "how dangerous" in question
        or "is this cyclone dangerous" in question
        or "severity" in question
        or "how severe" in question
        or "overall risk" in question
    ):
        answer = (
            f"The current cyclone risk is {risk_level} "
            f"with an MCDA risk score of {risk_score:.4f}/1.0. "
            f"The modelled wind speed is {wind:.2f} km/h and "
            f"72-hour rainfall is {rainfall:.2f} mm."
        )

        if highest_forecast:
            zone = highest_forecast.get("risk_zone", "UNKNOWN")

            if zone.upper() in ("HIGH", "CRITICAL"):
                answer += (
                    f" The forecast track reaches a "
                    f"{zone.upper()} risk zone at "
                    f"({highest_forecast.get('latitude')}, "
                    f"{highest_forecast.get('longitude')})."
                )

        return answer

    # =====================================================
    # RISK LEVEL
    # =====================================================

    if (
        "risk level" in question
        or "risk category" in question
        or "what is the risk" in question
    ):
        return (
            f"The current cyclone risk level is "
            f"{risk_level}, with a risk score of "
            f"{risk_score:.4f}/1.0."
        )

    # =====================================================
    # RISK SCORE
    # =====================================================

    if "risk score" in question or "score" in question:
        return (
            f"The calculated MCDA risk score is "
            f"{risk_score:.4f}/1.0, classified as "
            f"{risk_level} risk."
        )

    # =====================================================
    # WIND
    # =====================================================

    if "wind" in question or "winds" in question:

        if wind:
            return (
                f"The modelled wind speed is "
                f"{wind:.2f} km/h."
            )

    # =====================================================
    # RAIN / FLOODING
    # =====================================================

    if (
        "rain" in question
        or "rainfall" in question
        or "flood" in question
        or "flooding" in question
    ):

        if rainfall:
            if rainfall >= 200:
                severity = "very heavy rainfall"
            elif rainfall >= 100:
                severity = "heavy rainfall"
            else:
                severity = "moderate rainfall"

            return (
                f"The modelled 72-hour rainfall is "
                f"{rainfall:.2f} mm, indicating {severity}. "
                f"This may increase the potential for flooding "
                f"in vulnerable or low-lying areas."
            )

    # =====================================================
    # ELEVATION
    # =====================================================

    if "elevation" in question:

        return (
            f"The assessed elevation is "
            f"{elevation:.2f} m."
        )

    # =====================================================
    # BUILT-UP / URBAN EXPOSURE
    # =====================================================

    if (
        "built" in question
        or "urban" in question
    ):

        return (
            f"The assessed built-up percentage is "
            f"{builtup:.2f}%."
        )

    # =====================================================
    # HOSPITALS
    # =====================================================

    if "hospital" in question:

        if "50" in question:
            return (
                f"There are "
                f"{immediate.get('hospitals', 0)} hospitals "
                f"within 50 km."
            )

        if "100" in question:
            return (
                f"There are "
                f"{affected.get('hospitals', 0)} hospitals "
                f"within 100 km."
            )

        return (
            f"The assessment identifies "
            f"{affected.get('hospitals', 0)} hospitals "
            f"within the 100 km assessment zone, including "
            f"{immediate.get('hospitals', 0)} within 50 km."
        )

    # =====================================================
    # POWER / SUBSTATIONS
    # =====================================================

    if (
        "substation" in question
        or "power infrastructure" in question
        or "power" in question
    ):

        if "50" in question:
            return (
                f"There are "
                f"{immediate.get('power_substations', 0)} "
                f"power substations within 50 km."
            )

        if "100" in question:
            return (
                f"There are "
                f"{affected.get('power_substations', 0)} "
                f"power substations within 100 km."
            )

        return (
            f"The assessment identifies "
            f"{affected.get('power_substations', 0)} "
            f"power substations within 100 km, including "
            f"{immediate.get('power_substations', 0)} within 50 km."
        )

    # =====================================================
    # ROADS
    # =====================================================

    if "road" in question or "roads" in question:

        if "50" in question:
            return (
                f"{float(immediate.get('road_km', 0)):.2f} km "
                f"of roads are within 50 km."
            )

        if "100" in question:
            return (
                f"{float(affected.get('road_km', 0)):.2f} km "
                f"of roads are within 100 km."
            )

        return (
            f"The assessment covers "
            f"{float(affected.get('road_km', 0)):.2f} km "
            f"of roads within 100 km, including "
            f"{float(immediate.get('road_km', 0)):.2f} km "
            f"within 50 km."
        )

    # =====================================================
    # INFRASTRUCTURE / CRITICAL FACILITIES
    # =====================================================

    if (
        "infrastructure" in question
        or "critical facilities" in question
        or "critical facility" in question
    ):

        return (
            "The assessed infrastructure exposure is: "
            f"within 50 km, "
            f"{float(immediate.get('road_km', 0)):.2f} km "
            f"of roads, "
            f"{immediate.get('hospitals', 0)} hospitals, and "
            f"{immediate.get('power_substations', 0)} substations. "
            f"Within 100 km, "
            f"{float(affected.get('road_km', 0)):.2f} km "
            f"of roads, "
            f"{affected.get('hospitals', 0)} hospitals, and "
            f"{affected.get('power_substations', 0)} substations."
        )

    # =====================================================
    # FORECAST / TRACK / PATH
    # =====================================================

    if (
        "forecast" in question
        or "track" in question
        or "path" in question
        or "trajectory" in question
        or "where is it going" in question
    ):

        if not forecast:
            return "No forecast track information is available."

        first = forecast[0]
        last = forecast[-1]

        answer = (
            f"The forecast track begins near "
            f"({first.get('latitude')}, {first.get('longitude')}) "
            f"and progresses toward "
            f"({last.get('latitude')}, {last.get('longitude')})."
        )

        if highest_forecast:

            zone = highest_forecast.get(
                "risk_zone",
                "UNKNOWN"
            )

            score = highest_forecast.get(
                "proximity_score",
                0
            )

            answer += (
                f" The highest forecast risk is "
                f"{zone} with a proximity score of "
                f"{score}/100 at "
                f"({highest_forecast.get('latitude')}, "
                f"{highest_forecast.get('longitude')})."
            )

            if highest_forecast.get("timestamp"):
                answer += (
                    f" This point occurs at "
                    f"{highest_forecast.get('timestamp')}."
                )

        return answer

    # =====================================================
    # RISK ZONE
    # =====================================================

    if (
        "zone" in question
        or "risk zone" in question
        or "highest risk" in question
    ):

        if not forecast:
            return "No risk-zone information is available."

        if highest_forecast:

            return (
                f"The highest forecast risk zone is "
                f"{highest_forecast.get('risk_zone', 'UNKNOWN')} "
                f"with a proximity score of "
                f"{highest_forecast.get('proximity_score', 0)}/100 "
                f"at "
                f"({highest_forecast.get('latitude')}, "
                f"{highest_forecast.get('longitude')})."
            )

    # =====================================================
    # ADVISORY / ACTIONS
    # =====================================================

    if (
        "advice" in question
        or "advisory" in question
        or "recommendation" in question
        or "what should" in question
        or "what can authorities do" in question
        or "action" in question
        or "prepare" in question
    ):

        if intelligence.ai_advisory:
            return intelligence.ai_advisory

        return (
            "Authorities should monitor the cyclone track "
            "and intensity, prepare for high winds and rainfall, "
            "and assess exposed critical infrastructure."
        )

    # =====================================================
    # GENERAL IMPACT
    # =====================================================

    if (
        "impact" in question
        or "effect" in question
        or "affected" in question
    ):

        return (
            f"The current model assessment is "
            f"{risk_level} risk with a score of "
            f"{risk_score:.4f}/1.0. "
            f"Modelled hazards include "
            f"{wind:.2f} km/h winds and "
            f"{rainfall:.2f} mm of 72-hour rainfall. "
            f"The assessment also identifies "
            f"{affected.get('hospitals', 0)} hospitals and "
            f"{affected.get('power_substations', 0)} power "
            f"substations within 100 km."
        )

    # =====================================================
    # FALLBACK
    # =====================================================

    return (
        "I can answer questions about cyclone risk, "
        "risk score, wind speed, rainfall and flooding, "
        "elevation, built-up exposure, hospitals, roads, "
        "power infrastructure, forecast path, risk zones, "
        "impacts, and preparedness actions."
    )


def ask_intelligence(question, intelligence_output):
    """
    Public interface for the cyclone intelligence model.
    """

    if not question or not question.strip():
        return "Please provide a cyclone-related question."

    return answer_question(
        question,
        intelligence_output
    )