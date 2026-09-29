import pandas as pd

DATASET_PATH = "intelligence/data/raw/ibtracs_ni_filtered.csv"

dataset = pd.read_csv(DATASET_PATH)

print("\n======================================")
print("AVAILABLE REAL CYCLONES")
print("======================================")

print(
    dataset.groupby("NAME")["SEASON"]
    .agg(["min", "max", "count"])
    .sort_values("max", ascending=False)
)

print("\n======================================")
print("LATEST OBSERVATION FOR EACH CYCLONE")
print("======================================")

dataset["ISO_TIME"] = pd.to_datetime(
    dataset["ISO_TIME"],
    errors="coerce"
)

latest = (
    dataset.sort_values("ISO_TIME")
    .groupby("NAME")
    .tail(1)
)

print(
    latest[
        [
            "NAME",
            "SEASON",
            "ISO_TIME",
            "LAT",
            "LON",
            "WMO_WIND",
            "WMO_PRES"
        ]
    ]
    .sort_values("SEASON", ascending=False)
    .to_string(index=False)
)