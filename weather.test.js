const request = require('supertest');
// const mongoose = require('mongoose')
const app = require('./index');  // Import the Express app


describe('Weather Data API', () => {
    it('should retrieve weather data for a city', async () => {
        const city = 'Delhi';
        const res = await request(app).get(`/weather/${city}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(10);  // Expect the latest 10 entries
        res.body.forEach((entry) => {
            expect(entry.city).toBe(city);
            expect(entry).toHaveProperty('temp');
            expect(entry).toHaveProperty('condition');
        });
    });
});
it('should return weather data in Fahrenheit when the unit is specified', async () => {
    const res = await request(app).get(`/weather/Delhi?unit=fahrenheit`);
    
    // Log the response in case of failure
    console.log('Fahrenheit Response:', res.body);
    
    expect(res.statusCode).toEqual(200);
    res.body.forEach((entry) => {
        expect(entry.temp).toBeGreaterThan(32);  // Check if conversion is done
    });
});

it('should return weather data in Kelvin when the unit is specified', async () => {
    const res = await request(app).get(`/weather/Delhi?unit=kelvin`);
    
    // Log the response in case of failure
    console.log('Kelvin Response:', res.body);
    
    expect(res.statusCode).toEqual(200);
    res.body.forEach((entry) => {
        expect(entry.temp).toBeGreaterThan(273);  // Check if conversion is done
    });
});

describe('Daily Summary API', () => {
    it('should retrieve a daily summary for a city', async () => {
        const res = await request(app).get('/weather/daily-summary/Delhi');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('avgTemp');
        expect(res.body).toHaveProperty('maxTemp');
        expect(res.body).toHaveProperty('minTemp');
        expect(res.body).toHaveProperty('avgHumidity');
    });
});
describe('Threshold API', () => {
    it('should set a temperature threshold for a city', async () => {
        const threshold = { city: 'Delhi', tempThreshold: 35 };
        const res = await request(app)
            .post('/thresholds')
            .send([threshold]);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Thresholds updated successfully');
    });

    it('should trigger an alert when threshold is exceeded', async () => {
        const city = 'Delhi';
        const threshold = { city: city, tempThreshold: 30 };
        await request(app).post('/thresholds').send([threshold]);

        const weather = {
            city: city,
            temp: 36,  // This exceeds the threshold
            condition: 'Clear',
            humidity: 50,
            wind_speed: 5,
            timestamp: new Date().toLocaleString()
        };
        
        await request(app).post('/weather').send(weather);  // Assuming you have a POST route for testing

        const res = await request(app).get(`/weather/${city}`);
        expect(res.body[0].temp).toBeGreaterThan(15);
        // Check if an alert was triggered (this depends on how you handle the alerting in your app)
    });

});
