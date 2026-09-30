
import os
import json

from fastapi import APIRouter, HTTPException
from google import genai

router = APIRouter()


@router.post("/api/gemini")
async def generate_advisory(payload: dict):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing from environment variables."
        )

    cyclone = payload.get("cyclone", "Not provided")
    wind_speed = payload.get("wind_speed", "Not provided")
    location = payload.get("location", "Not provided")
    language = payload.get("language", "English")

    prompt = f"""
You are CycloneShield's emergency advisory assistant.

Generate a factual cyclone emergency advisory in {language}.

Use the supplied data:
- Cyclone: {cyclone}
- Wind speed (km/h): {wind_speed}
- Location: {location}

Do not invent cyclone facts, infrastructure details, dates, or forecasts.
Clearly state when information is unavailable.
Provide practical, general safety guidance where appropriate.

Return ONLY valid JSON in exactly this format:
{{
  "analysis": "A concise impact analysis based on the supplied data.",
  "directives": [
    "Emergency action 1",
    "Emergency action 2",
    "Emergency action 3",
    "Emergency action 4",
    "Emergency action 5"
  ]
}}

Both analysis and directives must be written in {language}.
"""

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            },
        )

        raw_text = response.text

        if not raw_text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response."
            )

        result = json.loads(raw_text)

        analysis = result.get("analysis", "")
        directives = result.get("directives", [])

        if not isinstance(analysis, str):
            analysis = str(analysis)

        if not isinstance(directives, list):
            directives = []

        directives = [
            item for item in directives
            if isinstance(item, str) and item.strip()
        ]

        return {
            "analysis": analysis,
            "directives": directives
        }

    except HTTPException:
        raise

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an invalid JSON response. Please try again."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini generation failed: {str(e)}"
        )