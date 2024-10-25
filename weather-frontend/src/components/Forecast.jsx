// src/components/Forecast.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Forecast.css';

const parseCustomTimestamp = (timestamp) => {
  const [datePart, timePart] = timestamp.split(', ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [time, modifier] = timePart.split(' ');
  let [hours, minutes, seconds] = time.split(':').map(Number);
  
  if (modifier === 'pm' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'am' && hours === 12) {
    hours = 0;
  }
  
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

function Forecast({ unit, city }) {
  const [forecastData, setForecastData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // Number of items to display per page

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/weather/forecast/${city}?unit=${unit}`);
        const sortedData = response.data.sort((a, b) => parseCustomTimestamp(b.timestamp) - parseCustomTimestamp(a.timestamp));
        setForecastData(sortedData);
      } catch (error) {
        console.error('Error fetching forecast:', error);
      }
    };
    fetchForecast();
  }, [city, unit]);

  const pageCount = Math.ceil(forecastData.length / itemsPerPage);
  const paginatedData = forecastData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleNext = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="forecast">
      <h2>Forecast for {city}</h2>
      {paginatedData.length > 0 ? (
        <ul>
          {paginatedData.map((data, index) => (
            <li key={index}>
              Temp: {data.temp.toFixed(2)}°, Condition: {data.condition}, Time: {parseCustomTimestamp(data.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No forecast available for this city.</p>
      )}
      <div>
        <button onClick={handlePrevious} disabled={currentPage === 0}>
          Previous
        </button>
        <button onClick={handleNext} disabled={currentPage === pageCount - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Forecast;
