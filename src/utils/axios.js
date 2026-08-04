import axios from 'axios';

const API = axios.create({
    baseURL: 'https://propertymaintain-backend-production.up.railway.app/api', // Added /api
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;