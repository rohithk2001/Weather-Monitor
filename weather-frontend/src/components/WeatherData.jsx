import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherData.css';

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

function WeatherData({ unit = "celsius", city }) {
  const [weatherData, setWeatherData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState(''); // Date input state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Fetch weather data
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/weather/${city}?unit=${unit}`);
      const sortedData = response.data.sort((a, b) => parseCustomTimestamp(b.timestamp) - parseCustomTimestamp(a.timestamp));
      setWeatherData(sortedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(); // Fetch on initial load and unit change
  }, [city, unit]);

  // Filter data based on selected date
  const filteredData = selectedDate
    ? weatherData.filter((data) => {
        const entryDate = parseCustomTimestamp(data.timestamp).toISOString().split('T')[0];
        return entryDate === selectedDate;
      })
    : weatherData;

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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
    <div className="weather-data">
      <h2>Weather Data for {city}</h2>

      {/* Button to manually fetch data */}
      <button onClick={fetchWeather}>Get Data</button>

      {/* Date input for filtering */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setCurrentPage(0); // Reset to the first page on date change
        }}
      />

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : paginatedData.length > 0 ? (
        <ul>
          {paginatedData.map((data) => (
            <li key={data._id}>
              Temp: {data.temp.toFixed(2)}°, Feels Like: {data.feels_like.toFixed(2)}°, Condition: {data.condition}, 
              Time: {parseCustomTimestamp(data.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available for this city on the selected date.</p>
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

export default WeatherData;
