from intelligence.models.intelligence_model import build_intelligence
from intelligence.data.dataset_stats import load_dataset_stats
from intelligence.ai.intelligence_qa import ask_intelligence


# ==========================================
# DATA
# ==========================================

dataset_stats = load_dataset_stats()


# Example cyclone data
max_wind_speed = 115
rainfall_72h = 500
elevation_mean = 20
hospital_count = 5
power_substation_count = 3
builtup_pct = 0.8


# Example forecast data
forecast_track = [
    {
        "latitude": 20.2,
        "longitude": 85.9,
        "risk_zone": "CRITICAL",
        "proximity_score": 90
    }
]


# Example risk zones
risk_zones = [
    {
        "risk_zone": "CRITICAL",
        "proximity_score": 90
    }
]


# Example infrastructure
infrastructure_exposure = {
    "immediate_50km": {
        "road_km": 1000,
        "hospitals": 5,
        "power_substations": 3
    },

    "affected_100km": {
        "road_km": 2500,
        "hospitals": 10,
        "power_substations": 7
    }
}


# ==========================================
# BUILD INTELLIGENCE MODEL
# ==========================================

intelligence_output = build_intelligence(
    max_wind_speed=max_wind_speed,
    rainfall_72h=rainfall_72h,
    elevation_mean=elevation_mean,
    hospital_count=hospital_count,
    power_substation_count=power_substation_count,
    builtup_pct=builtup_pct,
    dataset_stats=dataset_stats,
    forecast_track=forecast_track,
    risk_zones=risk_zones,
    infrastructure_exposure=infrastructure_exposure
)


# ==========================================
# OUTPUT
# ==========================================

print("\n======================================")
print("CYCLONE INTELLIGENCE MODEL")
print("======================================")

print(
    f"Risk Score : "
    f"{intelligence_output.risk_score:.4f}/1.0"
)

print(
    f"Risk Level : "
    f"{intelligence_output.risk_level}"
)

print("\nHAZARDS")
print("--------------------------------------")

for key, value in intelligence_output.hazards.items():
    print(f"{key}: {value}")


# ==========================================
# TEST QUESTIONS
# ==========================================

questions = [
    "Is this cyclone dangerous?",
    "What is the risk score?",
    "How strong are the winds?",
    "Could this cause flooding?",
    "How many hospitals could be affected?",
    "Could power infrastructure be affected?",
    "What is the cyclone's path?",
    "What is the highest risk zone?"
]


print("\n======================================")
print("INTELLIGENCE Q&A")
print("======================================")


for question in questions:

    answer = ask_intelligence(
        question,
        intelligence_output
    )

    print(f"\nQ: {question}")
    print(f"A: {answer}")