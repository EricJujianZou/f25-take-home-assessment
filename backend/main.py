"""
Backend FastAPI application for the Weather Data System.

This application provides endpoints to:
- Create a weather data request, which fetches data from the WeatherStack API.
- Retrieve the stored weather data by a unique ID.
"""

import os
import uuid
from typing import Any, Dict, Optional

import requests
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}


class WeatherRequest(BaseModel):
    """Request model for creating a weather data request."""
    date: str
    location: str
    notes: Optional[str] = ""


class WeatherResponse(BaseModel):
    """Response model for a successfully created weather data request."""
    id: str


@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    Handles the creation of a weather data request.

    1.  Receives form data (date, location, notes).
    2.  Calls the WeatherStack API for the specified location.
    3.  Stores the combined data (user request and weather data) with a unique ID in memory.
    4.  Returns the unique ID to the frontend.
    """
    weather_api_key = os.getenv("WEATHER_API_KEY")
    if not weather_api_key:
        raise HTTPException(
            status_code=500,
            detail="API key not found. Please create a .env file with WEATHER_API_KEY.",
        )

    url = f"http://api.weatherstack.com/current?access_key={weather_api_key}&query={request.location}"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Error retrieving data from Weather API: {e}")

    weather_data = response.json()
    weather_id = str(uuid.uuid4())

    weather_storage[weather_id] = {
        "user_request_data": request.model_dump(),
        "weather data": weather_data,
    }
    return WeatherResponse(id=weather_id)


@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")

    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)