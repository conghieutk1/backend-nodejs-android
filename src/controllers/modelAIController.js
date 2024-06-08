import modelAIService from '../services/modelAIService';
import dateUtils from '../utils/dateUtils';
import stringUtils from '../utils/stringUtils';
require('dotenv').config();
// const axios = require('axios');
import axios from 'axios';

let getPredictDisease = async (req, res) => {
    // console.log(req.body);
    let response = await modelAIService.getDataPredictFromPythonServer(req.body);
    // console.log('response modelAIService = ', response);

    return res.send(response);
};
let getInfomationWeatherToday = async (req, res) => {
    try {
        // Thay API_KEY bằng khóa API của bạn từ OpenWeatherMap
        const API_KEY = process.env.API_KEY_OPEN_WEATHER_MAP;
        const CITY_NAME = 'Hanoi';
        // const API_URL = `http://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${API_KEY}&units=metric`;
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?lang=vi&q=${CITY_NAME}&appid=${API_KEY}`;
        // Gửi yêu cầu GET đến API OpenWeatherMap
        const response = await axios.get(API_URL);

        // Lấy dữ liệu thời tiết từ phản hồi
        // const weatherData = response.data;
        // console.log('url ', API_URL);
        const weatherData = {
            dateTime: dateUtils.formatTimestampToDate2(response.data.dt),
            minTempC: response.data.main.temp_min - 273.15,
            maxTempC: response.data.main.temp_min - 273.15,
            curTempC: response.data.main.temp - 273.15,
            humidity: response.data.main.humidity + '%',
            city: response.data.name,
            description: stringUtils.capitalizeFirstLetter(response.data.weather[0].description),
            icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
        };

        // Trả về dữ liệu thời tiết dưới dạng JSON
        res.send(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Trả về mã lỗi 500 nếu có lỗi xảy ra
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
module.exports = {
    getPredictDisease,
    getInfomationWeatherToday,
};
