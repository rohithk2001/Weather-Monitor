// db.js
const mongoose = require('mongoose');


const thresholdSchema = new mongoose.Schema({
    city: String,
    tempThreshold: Number,
    alertTriggered: { type: Boolean, default: false }
});
const Threshold = mongoose.model('Threshold', thresholdSchema);


const weatherSchema = new mongoose.Schema({
    city: String,
    temp: Number,
    feels_like: Number,
    condition: String,
    humidity: Number,      // New field for humidity
    wind_speed: Number,    // New field for wind speed
    timestamp: {type : String }
});

const Weather = mongoose.model('Weather', weatherSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/weatherdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));




// Save fetched data to MongoDB
async function saveWeatherData(weather) {
    const newWeather = new Weather(weather);
    try {
        await newWeather.save();
        console.log(`Weather data for ${weather.city} saved to MongoDB`);
    } catch (error) {
        console.error(`Error saving data for ${weather.city}:`, error.message);
    }
}

module.exports = { Weather, saveWeatherData };
module.exports = { Weather, saveWeatherData, Threshold };