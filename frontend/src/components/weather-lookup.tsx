"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

//interface for weather data
interface WeatherData {
  user_request_data: {
    date: string;
    location: string;
    notes: string;
  };
  "weather data": {
    current: {
      temperature: number;
      weather_icons: string[];
      weather_descriptions: string[];
      wind_speed: number;
      humidity: number;
    };
    location: {
      name: string;
      country: string;
      localtime: string;
    };
  };
}

export function WeatherLookup() {
  const [id, setId] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError("Please enter a valid ID.");
      return;
    }
    setIsFetching(true);
    setWeatherData(null);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${id}`);
      if (response.ok) {
        let data = await response.json();
        // The backend might be sending an array with the data as the first element
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
        setWeatherData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to fetch weather data.");
      }
    } catch {
      setError("Network error: Could not connect to the server.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
        <CardDescription>
          Enter a weather request ID to retrieve the stored data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weather-id">Weather ID</Label>
            <Input
              id="weather-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your weather request ID"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isFetching}>
            {isFetching ? "Fetching..." : "Fetch Weather Data"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {weatherData && weatherData["weather data"] && weatherData.user_request_data && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Weather Details</h3>
            <div className="p-4 border rounded-lg bg-muted/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {weatherData["weather data"].current.temperature}°C
                  </p>
                  <p className="text-muted-foreground">
                    {weatherData["weather data"].location.name},{" "}
                    {weatherData["weather data"].location.country}
                  </p>
                </div>
                <img
                  src={weatherData["weather data"].current.weather_icons[0]}
                  alt={weatherData["weather data"].current.weather_descriptions[0]}
                  className="w-16 h-16"
                />
              </div>
              <div className="mt-4 text-sm">
                <p>
                  <strong>Description:</strong>{" "}
                  {weatherData["weather data"].current.weather_descriptions.join(
                    ", "
                  )}
                </p>
                <p>
                  <strong>Wind:</strong>{" "}
                  {weatherData["weather data"].current.wind_speed} km/h
                </p>
                <p>
                  <strong>Humidity:</strong>{" "}
                  {weatherData["weather data"].current.humidity}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Local Time: {weatherData["weather data"].location.localtime}
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/40">
              <h4 className="font-semibold mb-2">Original Request</h4>
              <p className="text-sm">
                <strong>Date:</strong> {weatherData.user_request_data.date}
              </p>
              <p className="text-sm">
                <strong>Location:</strong> {weatherData.user_request_data.location}
              </p>
              {weatherData.user_request_data.notes && (
                <p className="text-sm">
                  <strong>Notes:</strong> {weatherData.user_request_data.notes}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
