import axios from 'axios';
import { BASE_URL } from '../constants/apiConstants';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const sessionId = localStorage.getItem('sessionId');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (sessionId) {
            // Ensure the header is set. Axios 1.x allows setting on config.headers instance.
            config.headers['x-session-id'] = sessionId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
