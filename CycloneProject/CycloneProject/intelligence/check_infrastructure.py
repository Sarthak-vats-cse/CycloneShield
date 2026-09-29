import pandas as pd
from math import radians, sin, cos, sqrt, atan2

DATASET_PATH = "intelligence/data/model_dataset.csv"

CYCLONE_LAT = 19.2
CYCLONE_LON = 85.5


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


dataset = pd.read_csv(DATASET_PATH)

# Use only one copy of each grid cell
cells = dataset.drop_duplicates("cell_id").copy()

cells["distance_km"] = cells.apply(
    lambda row: calculate_distance(
        CYCLONE_LAT,
        CYCLONE_LON,
        row["latitude"],
        row["longitude"]
    ),
    axis=1
)

print("\n======================================")
print("INFRASTRUCTURE EXPOSURE CHECK")
print("======================================")

for radius in [50, 100, 150]:

    affected = cells[cells["distance_km"] <= radius]

    print(f"\n--- Within {radius} km ---")

    print(f"Grid cells       : {len(affected)}")
    print(f"Road length      : {affected['road_km'].sum():.2f} km")
    print(f"Hospitals        : {affected['hospital_count'].sum()}")
    print(f"Power substations: {affected['power_substation_count'].sum()}")

print("\n======================================")
print("DONE")
print("======================================")