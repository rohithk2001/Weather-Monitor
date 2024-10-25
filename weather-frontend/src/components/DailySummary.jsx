// src/components/DailySummary.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DailySummary.css';

function DailySummary({ unit, city }) { // Removed useParams since city is now passed as a prop
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`http://localhost:3000/weather/daily-summary/${city}?unit=${unit}`);
        console.log('Daily Summary Response:', response.data); // Log the response
        setSummary(response.data);
        setError(''); // Clear any previous error
      } catch (error) {
        setError('Error fetching daily summary. Please try again later.'); // Set error message
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchSummary();
  }, [city, unit]);

  return (
    <div className="daily-summary">
      <h2>Daily Summary for {city}</h2>
      {loading && <p>Loading summary...</p>}
      {error && <p>{error}</p>}
      {summary ? (
        <div>
          <p>Average Temp: {summary.avgTemp}°</p>
          <p>Max Temp: {summary.maxTemp}°</p>
          <p>Min Temp: {summary.minTemp}°</p>
          <p>Average Humidity: {summary.avgHumidity}%</p>
        </div>
      ) : (
        !loading && <p>No summary available.</p>
      )}
    </div>
  );
}

export default DailySummary;
