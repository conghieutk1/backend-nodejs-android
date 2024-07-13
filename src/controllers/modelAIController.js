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
// let getInfomationWeatherToday = async (req, res) => {
//     try {
//         // Thay API_KEY bằng khóa API của bạn từ OpenWeatherMap
//         const API_KEY = process.env.API_KEY_OPEN_WEATHER_MAP;
//         const CITY_NAME = 'Hanoi';
//         // const API_URL = `http://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${API_KEY}&units=metric`;
//         const API_URL = `https://api.openweathermap.org/data/2.5/weather?lang=vi&q=${CITY_NAME}&appid=${API_KEY}`;
//         // Gửi yêu cầu GET đến API OpenWeatherMap
//         const response = await axios.get(API_URL);

//         // Lấy dữ liệu thời tiết từ phản hồi
//         // const weatherData = response.data;
//         // console.log('url ', API_URL);
//         const weatherData = {
//             dateTime: dateUtils.formatTimestampToDate2(response.data.dt),
//             minTempC: response.data.main.temp_min - 273.15,
//             maxTempC: response.data.main.temp_min - 273.15,
//             curTempC: response.data.main.temp - 273.15,
//             humidity: response.data.main.humidity + '%',
//             city: response.data.name,
//             description: stringUtils.capitalizeFirstLetter(response.data.weather[0].description),
//             icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
//         };

//         // Trả về dữ liệu thời tiết dưới dạng JSON
//         res.send(weatherData);
//     } catch (error) {
//         console.error('Error fetching weather data:', error);
//         // Trả về mã lỗi 500 nếu có lỗi xảy ra
//         res.status(500).send({ error: 'Internal Server Error' });
//     }
// };
let getInfomationWeatherToday = async (req, res) => {
    try {
        // const API_KEY = '41d3cabdbe50b7fa44bdbd5367b6f735'; // Thay bằng khóa API từ Weatherstack process.env.API_KEY_WEATHERSTACK
        // const CITY_NAME = 'Hanoi';
        const API_URL = `http://api.weatherstack.com/current?access_key=${process.env.API_KEY_OPEN_WEATHER_MAP}&query=${process.env.API_CITY}&units=m`;

        const response = await axios.get(API_URL);
        // console.log('response ', response.data);
        const weatherData = {
            dateTime: dateUtils.formatTimestampToDate2(response.data.location.localtime_epoch),
            // minTempC: response.data.current.temperature,
            // maxTempC: response.data.current.temperature,
            curTempC: response.data.current.temperature,
            // humidity: response.data.current.humidity + '%',
            // city: response.data.location.name,
            city: 'Hà Nội',
            codeWeather: response.data.current.weather_code,
            description: stringUtils.capitalizeFirstLetter(response.data.current.weather_descriptions[0]),
            // icon: response.data.current.weather_icons[0], // Đường dẫn đến biểu tượng thời tiết
        };

        // Tắt caching bằng cách thiết lập các headers thích hợp
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).send(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getPredictDisease,
    getInfomationWeatherToday,
};
