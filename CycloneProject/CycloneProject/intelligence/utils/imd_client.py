import os
import requests


IMD_API_BASE_URL = "https://api.imd.gov.in"


def get_imd_data(endpoint):
    """
    Fetch data from the IMD API.

    The API token should be stored in the .env file
    and never hardcoded in the source code.
    """

    api_token = os.getenv("IMD_API_TOKEN")

    if not api_token:
        raise ValueError(
            "IMD_API_TOKEN is not configured. "
            "Add it to the .env file."
        )

    url = f"{IMD_API_BASE_URL}{endpoint}"

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Accept": "application/json"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=20
    )

    response.raise_for_status()

    return response.json()