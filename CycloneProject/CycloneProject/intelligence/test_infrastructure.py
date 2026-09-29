from intelligence.models.infrastructure_exposure import (
    assess_infrastructure_exposure,
    summarize_infrastructure_exposure,
    calculate_infrastructure_counts
)

cyclone_lat = 19.2
cyclone_lon = 85.5


infrastructure = [
    {
        "id": "SUB001",
        "name": "Coastal Power Substation",
        "type": "POWER_SUBSTATION",
        "latitude": 19.45,
        "longitude": 85.35
    },
    {
        "id": "ROAD001",
        "name": "Coastal Arterial Road",
        "type": "ROAD",
        "latitude": 19.75,
        "longitude": 85.10
    },
    {
        "id": "HOSP001",
        "name": "District Hospital",
        "type": "HOSPITAL",
        "latitude": 20.20,
        "longitude": 84.50
    }
]


results = assess_infrastructure_exposure(
    cyclone_lat,
    cyclone_lon,
    infrastructure
)
summary = summarize_infrastructure_exposure(results)
counts = calculate_infrastructure_counts(results)   

print("INFRASTRUCTURE EXPOSURE")
print("========================")

for item in results:

    print(
        f"{item['name']} | "
        f"{item['type']} | "
        f"{item['distance_from_cyclone_km']} km | "
        f"{item['risk_level']} ({item['risk_score']}/100)"
    )

print("\nINFRASTRUCTURE SUMMARY")
print("======================")

print(
    "Power substations:",
    len(summary["power_substations"])
)

print(
    "Roads:",
    len(summary["roads"])
)

print(
    "Hospitals:",
    len(summary["hospitals"])
)    
print("\nINFRASTRUCTURE AT RISK")
print("======================")

print(
    "Power substations at risk:",
    counts["power_substations_at_risk"]
)

print(
    "Roads at risk:",
    counts["roads_at_risk"]
)

print(
    "Hospitals affected:",
    counts["hospitals_affected"]
)