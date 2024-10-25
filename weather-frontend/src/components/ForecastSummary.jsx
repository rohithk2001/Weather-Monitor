// src/components/ForecastSummary.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ForecastSummary.css';

function ForecastSummary({ unit, city }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (city) { // Ensure the city is not empty
        try {
          const response = await axios.get(`http://localhost:3000/weather/forecast-summary/${city}?unit=${unit}`);
          setSummary(response.data);
        } catch (error) {
          console.error('Error fetching forecast summary:', error);
        }
      }
    };
    fetchSummary();
  }, [city, unit]); // Fetch data whenever the city or unit changes

  return (
    <div className="forecast-summary">
      <h2>Forecast Summary for {city}</h2>
      {summary ? (
        <div>
          <p>Average Temp: {summary.avgTemp}°</p>
          <p>Max Temp: {summary.maxTemp}°</p>
          <p>Min Temp: {summary.minTemp}°</p>
          <p>Average Humidity: {summary.avgHumidity}%</p>
          <p>Max Wind Speed: {summary.maxWindSpeed} km/h</p>
        </div>
      ) : (
        <p>No summary available.</p>
      )}
    </div>
  );
}

export default ForecastSummary;