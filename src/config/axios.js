// import axios from 'axios';
const axios = require('axios');
require('dotenv').config();

const axiosInstance = axios.create({
    baseURL: process.env.URL_AI_SERVER,
});

export default axiosInstance;
