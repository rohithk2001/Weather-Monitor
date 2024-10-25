// src/components/ThresholdInput.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ThresholdInput.css';

function ThresholdInput({ unit, city }) {
  const [threshold, setThreshold] = useState('');
  const [recentTemp, setRecentTemp] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchRecentTemperature = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/weather/${city}?unit=${unit}`);
        const mostRecentTemp = response.data[0]?.temp || null; // Get the most recent temperature
        setRecentTemp(mostRecentTemp);
      } catch (error) {
        console.error('Error fetching recent temperature:', error);
      }
    };
    if (city) {
      fetchRecentTemperature();
    }
  }, [city, unit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (recentTemp !== null && threshold !== '') {
      if (recentTemp > parseFloat(threshold)) {
        setAlertMessage(`Alert: The temperature has exceeded your threshold! Current Temp: ${recentTemp.toFixed(2)}°`);
      } else {
        setAlertMessage(`The temperature is within your threshold. Current Temp: ${recentTemp.toFixed(2)}°`);
      }
    } else {
      setAlertMessage('Unable to compare, please make sure both threshold and temperature data are available.');
    }
  };

  return (
    <div className="threshold-input">
      <h3>Set Temperature Threshold for {city}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="Enter threshold temperature"
          required
        />
        <button type="submit">Check Threshold</button>
      </form>
      
      {alertMessage && <p>{alertMessage}</p>}
    </div>
  );
}

export default ThresholdInput;
