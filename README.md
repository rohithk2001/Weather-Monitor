
## Weather Monitoring System

The Weather Monitoring System is a full-stack application that provides real-time weather data and forecasts for various cities. Leveraging the OpenWeatherMap API, this project enables users to retrieve current weather conditions, detailed forecasts, and summary reports, including average temperatures and humidity levels. The backend is built with Node.js and Express, providing RESTful API endpoints for seamless data retrieval. The frontend, developed using React, allows users to easily interact with the system, set temperature thresholds for alerts, and visualize weather trends. With a focus on user experience, this application aims to deliver accurate and timely weather information to help users make informed decisions based on weather conditions.

## Tech Stack Used

**Front-end:** React.js

**Back-end:** Node, Express

**Database:** MongoDB

**API:** OpenWeatherMap API

**Testing Tool:** Postman

**Tests:** jest

- **Other Libraries**: 
  - `axios` for API requests
  - `mongoose` for MongoDB connection
  - `node-cron` for scheduled operations (if applicable)
  - `cors` for cross-origin requests in development


## Features 

- Real-Time Weather Data: Fetch current weather conditions for any city using the OpenWeatherMap API.
- Forecast Functionality: Access detailed weather forecasts, including temperature trends and summaries.
- Threshold Alerts: Set temperature thresholds and receive alerts when the current temperature exceeds specified limits.
- User-Friendly Interface: Built with React for seamless user experience.
- Data Filtering and Pagination: Filter weather data by date and paginate through results for easier navigation.
## Setup and Installation

### Clone the Repository:

```bash
git clone <repository-url>
cd weather-monitoring-system

```
###  Backend Setup: 

- Install Dependencies:

```bash
npm install

```
- Create a .env file

 If you want to add add your own API key then Go to [Openweather](https://openweather.co.uk/) website and sign in to get your own API key.
```bash 
OWM_API_KEY=<your_api_key>
```
- Start the Backend Server

```bash 
npm start
```
### Frontend Setup 
- Navigate to Frontend: 
```bash
cd weather-frontend

```
- Install Dependencies:

```bash
npm install

```
- Start the frontend server:
```bash 
npm start
```
## MongoDb setup
- If you're using MongoDB locally, ensure MongoDB is running. If using MongoDB Atlas, update the connection string in the db.js file.

```js
 mongoose.connect('mongodb://localhost:27017/ruleEngineDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

```
- To keep things simple i have used the local databases

- If using MongoDB Atlas, replace 'mongodb://localhost:27017/ruleEngineDB' with your connection string.
  
## Usage

- Access the application in your web browser at http://localhost:3000/
- Select a city to view its current weather data and forecasts.
- Set temperature thresholds to receive alerts.
## API Reference

- Note: If you want to see the data in Celcius Format then remove the units parameter by default it shows the celcius data.

#### Get all items

- Get current weather data for a specific city.
```http
  GET /weather/:city?unit=<unit>:
```





- Get current forecast data for a specific city.
```http
  GET /weather/:city?unit=<unit>:
```


#### Get item
- Get forecast summary for a specific city.
```http
 GET /weather/forecast-summary/:city?unit=<unit>:
```



- Get forecast summary for a specific city.
```http
 GET /weather/forecast-summary/:city?unit=<unit>:
```


- Post the threshold value to check if the daily temperature has exceded the daily temperature

```http
  POST /threshold: 
```

## Dynamic Testing 

- To test the API endpoints, use Postman:

- Open Postman and create a new request.
- Set the request type to GET and enter the desired API endpoint.
- Check the response data for accuracy.

- set the request type to Post enter the desired API endpoint.

- In the body send the data in raw Json format 

```bash
  [
    {
        "city": "Mumbai",
        "tempThreshold": 3
    },
    {
        "city": "Chennai",
        "tempThreshold": 3
    },
    {
        "city": "Bangalore",
        "tempThreshold": 3
    },
    {
        "city": "Delhi",
        "tempThreshold": 3
    },
    {
        "city": "Hyderabad",
        "tempThreshold": 1
    },
    {
        "city": "Kolkata",
        "tempThreshold": 3
    }
]

```



## Running Automated Test Cases

-Before Running Automated tests Remove "app.test.js "from the weather-frontend/src



To run Automated tests, run the following command 

```bash
  npm test
```


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or features you'd like to add.
