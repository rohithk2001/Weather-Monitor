import React, { useState } from 'react';
import WeatherData from './components/WeatherData';
import DailySummary from './components/DailySummary';
import Forecast from './components/Forecast';
import ForecastSummary from './components/ForecastSummary';
import ThresholdInput from './components/ThresholdInput'; // Import the new component
import './App.css';


function App() {
  const [unit, setUnit] = useState('metric'); // Default to Celsius
  const [weatherCity, setWeatherCity] = useState(''); // Default city for weather
  const [summaryCity, setSummaryCity] = useState(''); // City for daily summary
  const [forecastCity, setForecastCity] = useState(''); // City for forecast
  const [forecastSummaryCity, setForecastSummaryCity] = useState(''); // City for forecast summary

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  // Render the WeatherData component
  const renderWeatherData = () => (
    <div>
      <input
        type="text"
        placeholder="Enter city name for Weather Data"
        value={weatherCity}
        onChange={(e) => setWeatherCity(e.target.value)}
      />
      <button onClick={() => setWeatherCity(weatherCity)}>Get Weather Data</button>
      <WeatherData unit={unit} city={weatherCity} />
    </div>
  );

  // Render the DailySummary component
  const renderDailySummary = () => (
    <div>
      <input
        type="text"
        placeholder="Enter city name for Daily Summary"
        value={summaryCity}
        onChange={(e) => setSummaryCity(e.target.value)}
      />
      <button onClick={() => setSummaryCity(summaryCity)}>Get Daily Summary</button>
      <DailySummary unit={unit} city={summaryCity} />
    </div>
  );

  // Render the Forecast component
  const renderForecast = () => (
    <div>
      <input
        type="text"
        placeholder="Enter city name for Forecast"
        value={forecastCity}
        onChange={(e) => setForecastCity(e.target.value)}
      />
      <button onClick={() => setForecastCity(forecastCity)}>Get Forecast</button>
      <Forecast unit={unit} city={forecastCity} />
    </div>
  );

  // Render the ForecastSummary component
  const renderForecastSummary = () => (
    <div>
      <input
        type="text"
        placeholder="Enter city name for Forecast Summary"
        value={forecastSummaryCity}
        onChange={(e) => setForecastSummaryCity(e.target.value)}
      />
      <button onClick={() => setForecastSummaryCity(forecastSummaryCity)}>Get Forecast Summary</button>
      <ForecastSummary unit={unit} city={forecastSummaryCity} />

      {/* Add the ThresholdInput component below the ForecastSummary */}
      <ThresholdInput unit={unit} city={forecastSummaryCity} />
    </div>
  );

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>

      {/* Dropdown for selecting temperature unit */}
      <label htmlFor="unit">Select Temperature Unit: </label>
      <select id="unit" value={unit} onChange={handleUnitChange}>
        <option value="metric">Centigrade</option>
        <option value="fahrenheit">Fahrenheit</option>
        <option value="kelvin">Kelvin</option>
      </select>

      {/* Render each component with its respective input and button */}
      <h2>Weather Data</h2>
      {renderWeatherData()}

      <h2>Daily Summary</h2>
      {renderDailySummary()}

      <h2>Forecast</h2>
      {renderForecast()}

      <h2>Forecast Summary</h2>
      {renderForecastSummary()}



    </div>
  );
}

export default App;
