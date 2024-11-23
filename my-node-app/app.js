import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const API_KEY = "a1463aa00c8a6f717ddfb9f64f06c07b";  // ใส่ API Key ของคุณที่นี่
const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast";

// สร้าง API endpoint
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }

    // สร้าง URL สำหรับเรียกข้อมูลอุณหภูมิ
    const weatherUrl = `${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    // สร้าง URL สำหรับเรียกข้อมูลพยากรณ์อากาศรายชั่วโมง
    const forecastUrl = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric&cnt=6`;

    try {
        // เรียกข้อมูลสภาพอากาศปัจจุบัน
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            return res.status(404).json({ error: "City not found" });
        }
        const weatherData = await weatherResponse.json();

        // เรียกข้อมูลพยากรณ์อากาศรายชั่วโมง
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            return res.status(404).json({ error: "Forecast data not found" });
        }
        const forecastData = await forecastResponse.json();

        // จัดรูปแบบข้อมูลที่ต้องการส่งกลับ
        const hourlyForecast = forecastData.list.map(item => ({
            time: item.dt_txt.split(' ')[1].slice(0, 5),  // เวลา
            temp: item.main.temp,                         // อุณหภูมิ
            description: item.weather[0].description,     // คำอธิบาย
            icon: item.weather[0].icon                    // ไอคอน
        }));

        res.json({
            city: weatherData.name,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            hourlyForecast: hourlyForecast
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
