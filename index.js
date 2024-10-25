require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
const { saveWeatherData } = require("./db");
const { Weather } = require("./db");
const { Threshold } = require("./db");
const cors = require('cors')

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];
const apiKey = process.env.OWM_API_KEY; // API key is pulled from .env file

async function fetchWeatherData(city) {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // Add units=metric for Celsius
  try {
    const response = await axios.get(url);
    const data = response.data;

    // Check if the response contains necessary data
    if (data.main) {
      const timestampUTC = new Date(data.dt * 1000);
      const timestampKolkata = timestampUTC.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true, // Optional: Set to false if you want 24-hour format
      });

      const weather = {
        city: city,
        temp: data.main.temp, // Already in Celsius due to units=metric
        feels_like: data.main.feels_like,
        condition: data.weather[0].main,
        humidity: data.main.humidity, // Add humidity
        wind_speed: data.wind.speed, // Add wind speed
        timestamp: timestampKolkata,
      };
      console.log(weather);

      // Save the fetched weather data to MongoDB
      await saveWeatherData(weather); // Move this line here

      // Check for threshold and trigger alert if necessary
      // Check for threshold and trigger alert if necessary
      const threshold = await Threshold.findOne({ city });
      if (threshold) {
        if (
          weather.temp > threshold.tempThreshold &&
          !threshold.alertTriggered
        ) {
          console.log(
            `ALERT! ${city}'s temperature exceeded ${threshold.tempThreshold}°C`
          );

          // Mark the alert as triggered in the database
          threshold.alertTriggered = true;
          await threshold.save();
        } else if (
          weather.temp <= threshold.tempThreshold &&
          threshold.alertTriggered
        ) {
          // Reset the alert if the temperature drops below the threshold
          threshold.alertTriggered = false;
          await threshold.save();
        }
      }

      return weather; // Optionally return the weather object
    } else {
      console.error(`No weather data found for ${city}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching data for ${city}:`, error.message);
    return null; // Return null if there's an error
  }
}

// Function to fetch forecast for a city
async function fetchWeatherForecast(city) {
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    try {
        const response = await axios.get(url);
        const forecastData = response.data.list.map(entry => ({
            city: city,
            temp: entry.main.temp - 273.15,  // Convert from Kelvin to Celsius
            feels_like: entry.main.feels_like - 273.15,
            condition: entry.weather[0].main,
            humidity: entry.main.humidity,
            wind_speed: entry.wind.speed,
            timestamp: new Date(entry.dt * 1000).toLocaleString()  // Convert timestamp
        }));
        return forecastData;
    } catch (error) {
        console.error(`Error fetching forecast data for ${city}:`, error);
        return { error: `Error fetching forecast data for ${city}` };
    }
}
// Function to generate a summary of the forecast
async function generateForecastSummary(city) {
    const forecast = await fetchWeatherForecast(city);

    // Summarize forecast data (e.g., calculate average temp, max/min temp, etc.)
    const summary = forecast.reduce((acc, curr) => {
        acc.tempSum += curr.temp;
        acc.maxTemp = Math.max(acc.maxTemp, curr.temp);
        acc.minTemp = Math.min(acc.minTemp, curr.temp);
        acc.humiditySum += curr.humidity;
        acc.windSpeedMax = Math.max(acc.windSpeedMax, curr.wind_speed);
        acc.conditions.push(curr.condition);  // Collect all conditions
        return acc;
    }, {
        tempSum: 0,
        maxTemp: -Infinity,
        minTemp: Infinity,
        humiditySum: 0,
        windSpeedMax: 0,
        conditions: []
    });

    // Calculate average temperature and humidity
    const avgTemp = (summary.tempSum / forecast.length).toFixed(2);
    const avgHumidity = (summary.humiditySum / forecast.length).toFixed(2);
    const dominantCondition = getDominantCondition(summary.conditions);  // Find the most common weather condition

    // Return the summary object
    return {
        city: city,
        avgTemp,
        maxTemp: summary.maxTemp.toFixed(2),
        minTemp: summary.minTemp.toFixed(2),
        avgHumidity,
        maxWindSpeed: summary.windSpeedMax.toFixed(2),
        dominantCondition
    };
}


// Schedule to fetch weather data every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Fetching weather data...");
  for (const city of cities) {
    await fetchWeatherData(city); // Fetch weather data for each city
  }
});

//new api routes
//Route to get weather data for a specific city (latest 10 entries
app.get("/weather/:city", async (req, res) => {
  try {
    const { unit } = req.query;
    let weatherData = await Weather.find({ city: req.params.city })
      .sort({ timestamp: -1 })
      .limit(10);

    if (!weatherData || weatherData.length === 0) {
      return res.status(404).json({ error: "No weather data found for this city" });
    }

    if (unit === "fahrenheit") {
      weatherData = weatherData.map(data => {
        data.temp = (data.temp * 1.8) + 32;
        data.feels_like = (data.feels_like * 1.8) + 32;
        return data;
      });
    } else if (unit === "kelvin") {
      weatherData = weatherData.map(data => {
        data.temp = data.temp + 273;
        data.feels_like = data.feels_like + 273;
        return data;
      });
    }

    res.json(weatherData);
  } catch (error) {
    console.error("Error in /weather/:city:", error); // Make sure to log the full error
    res.status(500).json({ error: "Error retrieving weather data" });
  }
});

// Route to get daily summary for a specific city
app.get("/weather/daily-summary/:city", async (req, res) => {
    const { unit } = req.query;
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Reset time to midnight
    const weatherData = await Weather.aggregate([
      {
        $match: {
          city: req.params.city,
          timestamp: { $gte: today.toISOString() },
        },
      },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: "$temp" },
          minTemp: { $min: "$temp" },
          maxTemp: { $max: "$temp" },
          minHumidity: { $min: "$humidity" }, // Add min humidity
          maxHumidity: { $max: "$humidity" }, // Add max humidity
          avgHumidity: { $avg: "$humidity" }, // Calculate avg humidity
          maxWindSpeed: { $max: "$wind_speed" }, // Add max wind speed
          avgWindSpeed: { $avg: "$wind_speed" }, // Calculate avg wind speed
          dominantCondition: { $push: "$condition" },
        },
      },
    ]);

    if (weatherData.length === 0) {
      return res.json({ message: "No data available for today" });
    }

    if (unit === "fahrenheit") {
        weatherData[0].avgTemp = (weatherData[0].avgTemp *1.8) + 32;
        weatherData[0].minTemp = (weatherData[0].minTemp *1.8) + 32;
        weatherData[0].maxTemp = (weatherData[0].maxTemp *1.8) + 32;
      }
      if (unit === "kelvin"){
        weatherData[0].avgTemp = weatherData[0].avgTemp + 273;
        weatherData[0].minTemp = weatherData[0].minTemp + 273;
        weatherData[0].maxTemp = weatherData[0].maxTemp + 273;
      }
    
    const dominantCondition = getDominantCondition(
      weatherData[0].dominantCondition
    );
    res.json({
      avgTemp: weatherData[0].avgTemp.toFixed(2),
      minTemp: weatherData[0].minTemp.toFixed(2),
      maxTemp: weatherData[0].maxTemp.toFixed(2),
      minHumidity: weatherData[0].minHumidity.toFixed(2), // Include min humidity
      maxHumidity: weatherData[0].maxHumidity.toFixed(2), // Include max humidity
      avgHumidity: weatherData[0].avgHumidity.toFixed(2), // Include avg humidity
      avgWindSpeed: weatherData[0].avgWindSpeed.toFixed(2), // Include avg wind speed
      maxWindSpeed: weatherData[0].maxWindSpeed.toFixed(2), // Include max wind speed
      dominantCondition: dominantCondition,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving daily summary" });
  }
});

// Helper function to determine the most common weather condition
function getDominantCondition(conditions) {
  const conditionCount = {};
  conditions.forEach((condition) => {
    conditionCount[condition] = (conditionCount[condition] || 0) + 1;
  });
  return Object.keys(conditionCount).reduce((a, b) =>
    conditionCount[a] > conditionCount[b] ? a : b
  );
}
// API route to set a temperature threshold for a city
// Route to create or update a temperature threshold for a city
app.post("/thresholds", async (req, res) => {
  const thresholds = req.body;

  // Validate request data
  if (!Array.isArray(thresholds)) {
    return res
      .status(400)
      .json({ error: "Request body must be an array of thresholds" });
  }

  try {
    // Loop through each item in the array and update or create the threshold
    for (let item of thresholds) {
      const { city, tempThreshold } = item;
      if (!city || !tempThreshold) {
        return res
          .status(400)
          .json({ error: "City and tempThreshold are required for each item" });
      }
      await Threshold.findOneAndUpdate(
        { city },
        { tempThreshold, alertTriggered: false },
        { new: true, upsert: true }
      );
    }
    res.json({ message: "Thresholds updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error setting or updating threshold" });
  }
});

// GET route to display forecast data for a city
app.get('/weather/forecast/:city', async (req, res) => {
    const city = req.params.city;
    const { unit } = req.query;

    // Check if the city is in our list
    if (!cities.includes(city)) {
        return res.status(400).json({ error: 'City not supported. Available cities: ' + cities.join(', ') });
    }

    // Fetch the weather forecast for the given city
    const forecast = await fetchWeatherForecast(city);

    if (unit === "fahrenheit") {
        forecast.forEach(data => {
          data.temp = (data.temp *1.8) + 32;
          data.feels_like = (data.feels_like *1.8) + 32;
        });
      }
      if (unit === "kelvin") {
        forecast.forEach(data => {
          data.temp = data.temp  + 273;
          data.feels_like = data.feels_like + 273;
        });
      }
    // Serve the forecast data as JSON
    res.json(forecast);
});

// GET route to fetch forecast summary for a specific city
app.get('/weather/forecast-summary/:city', async (req, res) => {
    const city = req.params.city;
    const { unit }= req.query;

    // Check if the city is in our list of supported cities
    if (!cities.includes(city)) {
        return res.status(400).json({ error: `City not supported. Available cities: ${cities.join(', ')}` });
    }

    // Generate the forecast summary for the given city
    const forecastSummary = await generateForecastSummary(city);
     
    if (unit === "fahrenheit") {
        forecastSummary.avgTemp = (forecastSummary.avgTemp *1.8) + 32;
        forecastSummary.minTemp = (forecastSummary.minTemp *1.8) + 32;
        forecastSummary.maxTemp = (forecastSummary.maxTemp *1.8) + 32;
      }
      if (unit === "kelvin") {
        forecastSummary.avgTemp = forecastSummary.avgTemp+ 273;
        forecastSummary.minTemp = forecastSummary.minTemp + 273;
        forecastSummary.maxTemp = forecastSummary.maxTemp + 273;
      }


    res.json(forecastSummary);
});

app.listen(port, () => {
  console.log(`\nServer listening on port ${port}\n`);
});

module.exports =  app;