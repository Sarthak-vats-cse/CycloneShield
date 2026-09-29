import pandas as pd

DATASET_PATH = "intelligence/data/model_dataset.csv"


def load_dataset_stats():
    """
    Calculate normalization statistics from the team's model dataset.
    """

    dataset = pd.read_csv(DATASET_PATH)

    # Derived features used by the MCDA model
    dataset["inverse_elevation"] = (
        1 / (dataset["elevation_mean"] + 1)
    )

    dataset["infrastructure_exposure"] = (
        dataset["hospital_count"]
        + dataset["power_substation_count"]
    )

    stats = {
        "max_wind_speed_min": dataset["max_wind_speed"].min(),
        "max_wind_speed_max": dataset["max_wind_speed"].max(),

        "rainfall_72h_min": dataset["rainfall_72h"].min(),
        "rainfall_72h_max": dataset["rainfall_72h"].max(),

        "inverse_elevation_min": dataset["inverse_elevation"].min(),
        "inverse_elevation_max": dataset["inverse_elevation"].max(),

        "infrastructure_min": dataset["infrastructure_exposure"].min(),
        "infrastructure_max": dataset["infrastructure_exposure"].max(),

        "builtup_pct_min": dataset["builtup_pct"].min(),
        "builtup_pct_max": dataset["builtup_pct"].max(),
    }

    return stats


if __name__ == "__main__":
    stats = load_dataset_stats()

    print("Dataset Normalization Statistics")
    print("--------------------------------")

    for key, value in stats.items():
        print(f"{key}: {value}")