import os
from dotenv import load_dotenv
from google import genai
from intelligence.models.intelligence_model import build_intelligence
from intelligence.risk_engine import calculate_mcda_risk, risk_level
from intelligence.data.dataset_stats import load_dataset_stats
from math import radians, sin, cos, sqrt, atan2
from intelligence.ai.intelligence_qa import ask_intelligence

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")


# Create Gemini client
client = genai.Client(api_key=api_key)


from intelligence.models.cyclone_scenario import CycloneScenario
from intelligence.models.forecast import analyze_forecast


from intelligence.data.cyclone_loader import (
    load_cyclone,
    get_valid_track,
    get_peak_intensity
)

# Select cyclone
CYCLONE_OPTIONS = {
    "FANI": 2019,
    "PHAILIN": 2013,
    "TITLI": 2018
}

print("\nAvailable Cyclones:")
for name, season in CYCLONE_OPTIONS.items():
    print(f"- {name} ({season})")

CYCLONE_NAME = input("\nEnter cyclone name: ").strip().upper()

if CYCLONE_NAME not in CYCLONE_OPTIONS:
    raise ValueError(
        f"Invalid cyclone. Choose from: {', '.join(CYCLONE_OPTIONS.keys())}"
    )

CYCLONE_SEASON = CYCLONE_OPTIONS[CYCLONE_NAME]

cyclone_data = load_cyclone(CYCLONE_NAME, CYCLONE_SEASON)

track = get_valid_track(cyclone_data)

peak = get_peak_intensity(track)

peak_wind_knots = float(peak["WMO_WIND"])
peak_wind_kmh = peak_wind_knots * 1.852

# --------------------------------------------------
# Select a representative impact location
# near the model's geographic study area.
# --------------------------------------------------
# Load the team's verified MCDA dataset
import pandas as pd
dataset = pd.read_csv("intelligence/data/model_dataset.csv")
dataset = dataset[
    dataset["cyclone_name"].str.upper() == CYCLONE_NAME.upper()
].copy()

if dataset.empty:
    raise ValueError(
        f"No model data found for cyclone: {CYCLONE_NAME}"
    )
grid_center_lat = dataset["latitude"].mean()
grid_center_lon = dataset["longitude"].mean()

track_for_location = track.copy()

track_for_location["distance_to_grid_center"] = (
    (track_for_location["LAT"] - grid_center_lat) ** 2
    + (track_for_location["LON"] - grid_center_lon) ** 2
)

impact_point = track_for_location.loc[
    track_for_location["distance_to_grid_center"].idxmin()
]

impact_lat = float(impact_point["LAT"])
impact_lon = float(impact_point["LON"])

cyclone = CycloneScenario(
    name=CYCLONE_NAME,
    latitude=impact_lat,
    longitude=impact_lon,
    wind_speed_kmh=peak_wind_kmh,
    pressure_hpa=float(peak["WMO_PRES"]),
    movement_direction="NW",
    forecast=[
        {
            "latitude": float(row["LAT"]),
            "longitude": float(row["LON"]),
            "time": row["ISO_TIME"].isoformat()
        }
        for _, row in track.iterrows()
    ]
)

forecast_analysis = analyze_forecast(
    cyclone.latitude,
    cyclone.longitude,
    cyclone.forecast
)
print("\nFORECAST TRACK")
print("--------------------------------------")

for point in forecast_analysis:
    print(
        f"{point['time']} → "
        f"({point['latitude']}, {point['longitude']}) | "
        f"{point['distance_from_current_km']} km | "
        f"Movement: {point['movement_speed_kmh']} km/h | "
        f"Zone: {point['risk_zone']} "
        f"({point['proximity_score']}/100)"
    )




# Find the dataset cell closest to the cyclone's current position
dataset["distance_from_cyclone"] = (
    (dataset["latitude"] - cyclone.latitude) ** 2
    + (dataset["longitude"] - cyclone.longitude) ** 2
)

closest_cell = dataset.loc[
    dataset["distance_from_cyclone"].idxmin()
]

# Load normalization statistics used by the team's MCDA formula
dataset_stats = load_dataset_stats()

# Calculate MCDA risk using the closest geographic cell
risk_score = calculate_mcda_risk(
    max_wind_speed=closest_cell["max_wind_speed"],
    rainfall_72h=closest_cell["rainfall_72h"],
    elevation_mean=closest_cell["elevation_mean"],
    hospital_count=closest_cell["hospital_count"],
    power_substation_count=closest_cell["power_substation_count"],
    builtup_pct=closest_cell["builtup_pct"],
    dataset_stats=dataset_stats
)

risk_result = {
    "risk_score": risk_score,
    "risk_level": risk_level(risk_score)
}
def calculate_distance(lat1, lon1, lat2, lon2):
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

    return earth_radius * c
# Real infrastructure exposure from the team's model dataset

def calculate_infrastructure_exposure(dataset, cyclone_lat, cyclone_lon):

    infrastructure_cells = dataset.drop_duplicates("cell_id").copy()

    infrastructure_cells["distance_km"] = infrastructure_cells.apply(
    lambda row: calculate_distance(
        cyclone_lat,
        cyclone_lon,
        row["latitude"],
        row["longitude"]
    ),
    axis=1
)

    immediate_area = infrastructure_cells[
        infrastructure_cells["distance_km"] <= 50
    ]

    affected_area = infrastructure_cells[
        infrastructure_cells["distance_km"] <= 100
    ]

    return {
        "immediate_50km": {
            "road_km": round(immediate_area["road_km"].sum(), 2),
            "hospitals": int(immediate_area["hospital_count"].sum()),
            "power_substations": int(
                immediate_area["power_substation_count"].sum()
            )
        },
        "affected_100km": {
            "road_km": round(affected_area["road_km"].sum(), 2),
            "hospitals": int(affected_area["hospital_count"].sum()),
            "power_substations": int(
                affected_area["power_substation_count"].sum()
            )
        }
    }


infrastructure_summary = calculate_infrastructure_exposure(
    dataset,
    cyclone.latitude,
    cyclone.longitude
)

forecast_summary = "\n".join(
    [
        f"- {point['time']}: "
        f"{point['latitude']}, {point['longitude']} | "
        f"{point['distance_from_current_km']} km | "
        f"{point['risk_zone']} risk zone"
        for point in forecast_analysis
    ]
)

# Build the intelligence prompt
prompt = f"""
You are an AI-powered cyclone risk intelligence assistant
for disaster-management decision support.

Interpret the calculated model outputs below and provide a
SHORT, CLEAR operational summary.

IMPORTANT RULES:
- Treat risk scores as model-generated indicators, not probabilities.
- Do not claim damage, flooding, casualties, or evacuation is certain.
- Do not invent infrastructure, population, locations, or observations.
- Do not issue legally authoritative evacuation orders.
- Use "may", "could", "potential", or "elevated risk" where appropriate.
- Base your response only on the provided data.

Cyclone:
Name: {cyclone.name}
Location: {cyclone.latitude}, {cyclone.longitude}
Current Wind: {cyclone.wind_speed_kmh:.1f} km/h
Pressure: {cyclone.pressure_hpa:.0f} hPa
Direction: {cyclone.movement_direction}

Risk:
MCDA Score: {risk_result["risk_score"]:.4f}/1.0
Risk Level: {risk_result["risk_level"]}

Hazards:
Model Wind: {closest_cell["max_wind_speed"] * 1.852:.1f} km/h
72h Rainfall: {closest_cell["rainfall_72h"]} mm
Elevation: {closest_cell["elevation_mean"]} m
Built-up: {closest_cell["builtup_pct"]}%

Infrastructure:
50 km:
Roads: {infrastructure_summary["immediate_50km"]["road_km"]} km
Hospitals: {infrastructure_summary["immediate_50km"]["hospitals"]}
Substations: {infrastructure_summary["immediate_50km"]["power_substations"]}

100 km:
Roads: {infrastructure_summary["affected_100km"]["road_km"]} km
Hospitals: {infrastructure_summary["affected_100km"]["hospitals"]}
Substations: {infrastructure_summary["affected_100km"]["power_substations"]}

Forecast:
{forecast_summary}

RETURN EXACTLY THESE 5 SECTIONS:

1. IMPACT
Write only 3-4 short sentences explaining the overall situation.

2. KEY RISKS
Give exactly 3-5 bullet points.
Mention only the most important hazards.

3. INFRASTRUCTURE
Give exactly 3-5 bullet points.
Mention only the most important infrastructure exposure.

4. ACTIONS
Give exactly 3-5 short bullet points.
Focus on practical preparedness actions.

5. EARLY WARNING
Write ONE short paragraph of maximum 3 sentences
for local authorities.

IMPORTANT:
- Keep the entire response below 350 words.
- Do not repeat the same number multiple times unnecessarily.
- Do not explain the methodology or MCDA formula.
- Do not include a conclusion or additional sections.
- Keep the language clear enough for a dashboard.
"""


# Ask Gemini for the assessment
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
)

# ==========================================
# BUILD FINAL INTELLIGENCE MODEL
# ==========================================

intelligence_output = build_intelligence(
    max_wind_speed=float(closest_cell["max_wind_speed"]),
    rainfall_72h=float(closest_cell["rainfall_72h"]),
    elevation_mean=float(closest_cell["elevation_mean"]),
    hospital_count=int(closest_cell["hospital_count"]),
    power_substation_count=int(
        closest_cell["power_substation_count"]
    ),
    builtup_pct=float(closest_cell["builtup_pct"]),
    dataset_stats=dataset_stats,
    forecast_track=forecast_analysis,
    risk_zones=forecast_analysis,
    infrastructure_exposure=infrastructure_summary,
)

# Attach Gemini's operational advisory
intelligence_output.ai_advisory = response.text
# Test Intelligence Q&A
print("\nINTELLIGENCE Q&A")
print("--------------------------------")

questions = [
    "Is this cyclone dangerous?",
    "How strong are the winds?",
    "Could this cause flooding?",
    "How many hospitals could be affected?",
    "What critical facilities are exposed?",
    "Could power infrastructure be affected?",
    "What is the cyclone's path?",
    "What should authorities do?"
]

for question in questions:
    print(f"\nQ: {question}")
    print(
        f"A: {ask_intelligence(question, intelligence_output)}"
    )

    
print("======================================")
print("CYCLONE AI RISK ASSESSMENT")
print("======================================")

print(f"Risk Score : {risk_result['risk_score']}/1.0")
print(f"Risk Level : {risk_result['risk_level']}")

print("\nGEMINI ANALYSIS")
print("--------------------------------------")
print(response.text)


print("\nSTRUCTURED INTELLIGENCE OUTPUT")
print("--------------------------------")

structured = intelligence_output.to_dict()

print(f"Risk Score       : {structured['risk_score']:.4f} / 1.0")
print(f"Risk Level       : {structured['risk_level']}")

print("\nInfrastructure Exposure")

infra_50 = structured["infrastructure_exposure"]["immediate_50km"]
infra_100 = structured["infrastructure_exposure"]["affected_100km"]

print("  Within 50 km")
print(f"    Roads        : {infra_50['road_km']:.2f} km")
print(f"    Hospitals    : {infra_50['hospitals']}")
print(f"    Substations  : {infra_50['power_substations']}")

print("  Within 100 km")
print(f"    Roads        : {infra_100['road_km']:.2f} km")
print(f"    Hospitals    : {infra_100['hospitals']}")
print(f"    Substations  : {infra_100['power_substations']}")

print("\nAI Advisory      : Generated successfully")