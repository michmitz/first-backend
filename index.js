require('dotenv').config();
const request = require('superagent');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

const { GEOCODE_API_KEY, WEATHERBIT_API_KEY, HIKING_API_KEY, YELP_API_KEY } = process.env;

async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${WEATHERBIT_API_KEY}`);

    const forecastArray = response.body.data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        };

    });

    const slicedForecast = forecastArray.slice(0, 8);

    return slicedForecast;
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

    const slicedTrails = trailsArray.slice(0, 10);

    return slicedTrails;
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

async function getYelp(lat, lon) {
    const response = await request.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}`).set('Authorization', `Bearer ${YELP_API_KEY}`);

    const yelpData = response.body.businesses;

    const yelpArray = yelpData.map((yelpItem) => {
        return {
            name: yelpItem.name,
            image_url: yelpItem.image_url,
            price: yelpItem.price,
            rating: yelpItem.rating,
            url: yelpItem.url
        };

    });

    const slicedReviews = yelpArray.slice(0, 10);

    return slicedReviews;
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

app.get('/yelp', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = await getYelp(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});