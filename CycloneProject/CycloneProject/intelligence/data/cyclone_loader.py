import pandas as pd


DATASET_PATH = "intelligence/data/raw/ibtracs_ni_filtered.csv"


def load_cyclone(name, season=None):
    dataset = pd.read_csv(DATASET_PATH)

    dataset["ISO_TIME"] = pd.to_datetime(
        dataset["ISO_TIME"],
        errors="coerce"
    )

    cyclone = dataset[
        dataset["NAME"].str.upper() == name.upper()
    ].copy()

    if season is not None:
        cyclone = cyclone[
            cyclone["SEASON"] == season
        ]

    cyclone = cyclone.sort_values("ISO_TIME")

    if cyclone.empty:
        raise ValueError(
            f"Cyclone '{name}' was not found in the dataset."
        )

    return cyclone

def get_valid_track(cyclone):
    track = cyclone[
        cyclone["LAT"].notna()
        & cyclone["LON"].notna()
        & cyclone["ISO_TIME"].notna()
    ].copy()

    return track.sort_values("ISO_TIME")
def get_peak_intensity(track):
    intensity_track = track.dropna(
        subset=["WMO_WIND", "WMO_PRES"]
    ).copy()

    if intensity_track.empty:
        raise ValueError("No valid wind/pressure observations found.")

    peak = intensity_track.loc[
        intensity_track["WMO_WIND"].idxmax()
    ]

    return peak    
if __name__ == "__main__":

    cyclone = load_cyclone("FANI", 2019)
    track = get_valid_track(cyclone)
    
    peak = get_peak_intensity(track)

    print("\n======================================")
    print("PEAK INTENSITY")
    print("======================================")

    print(f"Time       : {peak['ISO_TIME']}")
    print(f"Latitude   : {peak['LAT']}")
    print(f"Longitude  : {peak['LON']}")
    wind_knots = float(peak["WMO_WIND"])
    wind_kmh = wind_knots * 1.852

    print(f"WMO Wind   : {wind_knots} knots ({wind_kmh:.1f} km/h)")
    print(f"WMO Pressure: {peak['WMO_PRES']} hPa")
    print("\n======================================")
    print("CYCLONE LOADER TEST")
    print("======================================")

    print(f"Name       : FANI")
    print(f"Season     : 2019")
    print(f"Observations: {len(track)}")

    print("\nFirst observations:")
    print(
        cyclone[
            [
                "ISO_TIME",
                "LAT",
                "LON",
                "WMO_WIND",
                "WMO_PRES"
            ]
        ].head(5).to_string(index=False)
    )

    print("\nLast observations:")
    print(
        cyclone[
            [
                "ISO_TIME",
                "LAT",
                "LON",
                "WMO_WIND",
                "WMO_PRES"
            ]
        ].tail(5).to_string(index=False)
    )

