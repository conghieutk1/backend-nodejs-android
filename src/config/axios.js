import axios from 'axios';
require('dotenv').config();

const axiosInstance = axios.create({
    baseURL: process.env.URL_AI_SERVER,
});

export default axiosInstance;
