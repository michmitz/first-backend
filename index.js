require('dotenv').config();
const request = require('superagent');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

const { GEOCODE_API_KEY, WEATHERBIT_API_KEY, HIKING_API_KEY } = process.env;

async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${WEATHERBIT_API_KEY}`);
    // const data = weatherData.data;

    const forecastArray = response.body.data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        };

    });

    return forecastArray;
}

async function getTrails(lat, lon) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${HIKING_API_KEY}`);

    const trailData = response.body.trails;

    const trailsArray = trailData.map((trailItem) => {
        return {
            name: trailItem.name,
            location: trailItem.location,
            length: trailItem.length,
            stars: trailItem.stars,
            star_votes: trailItem.starVotes,
            summary: trailItem.summary,
            trail_url: trailItem.url,
            conditions: trailItem.conditionStatus,
            condition_date: trailItem.conditionDate.split(' ')[0],
            condition_time: trailItem.conditionDate.split(' ')[1]

        };

    });

    return trailsArray;
}




async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);

    const city = response.body[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;
    
        const mungedData = await getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
    
});

app.get('/weather', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = await getWeather(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/trails', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = await getTrails(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});