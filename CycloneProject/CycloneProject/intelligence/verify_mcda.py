import pandas as pd

from risk_engine import calculate_mcda_risk
from data.dataset_stats import load_dataset_stats


DATASET_PATH = "intelligence/data/model_dataset.csv"


dataset = pd.read_csv(DATASET_PATH)

stats = load_dataset_stats()

# Take the first row from the real dataset
row = dataset.iloc[0]

calculated_score = calculate_mcda_risk(
    max_wind_speed=row["max_wind_speed"],
    rainfall_72h=row["rainfall_72h"],
    elevation_mean=row["elevation_mean"],
    hospital_count=row["hospital_count"],
    power_substation_count=row["power_substation_count"],
    builtup_pct=row["builtup_pct"],
    dataset_stats=stats
)

original_score = row["risk_score"]

print("MCDA Verification")
print("-----------------")
print(f"Cyclone        : {row['cyclone_name']}")
print(f"Cell ID        : {row['cell_id']}")
print(f"Original Score : {original_score}")
print(f"Our Score      : {calculated_score}")
print(f"Difference     : {abs(original_score - calculated_score)}")