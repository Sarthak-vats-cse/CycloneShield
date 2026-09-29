import pandas as pd

DATASET_PATH = "intelligence/data/raw/ibtracs_ni_filtered.csv"

dataset = pd.read_csv(DATASET_PATH)

fani = dataset[
    dataset["NAME"].str.upper() == "FANI"
].copy()

fani["WMO_WIND"] = pd.to_numeric(
    fani["WMO_WIND"],
    errors="coerce"
)

fani["WMO_PRES"] = pd.to_numeric(
    fani["WMO_PRES"],
    errors="coerce"
)

print("\n======================================")
print("FANI PEAK WIND OBSERVATION")
print("======================================")

peak_wind = fani.loc[fani["WMO_WIND"].idxmax()]

print(f"Time         : {peak_wind['ISO_TIME']}")
print(f"Latitude     : {peak_wind['LAT']}")
print(f"Longitude    : {peak_wind['LON']}")
print(f"WMO Wind     : {peak_wind['WMO_WIND']} knots")
print(f"WMO Pressure : {peak_wind['WMO_PRES']} hPa")
print(f"New Delhi Wind: {peak_wind['NEWDELHI_WIND']} knots")

print("\n======================================")