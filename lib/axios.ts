import axios from 'axios';

// Debugging ke liye: console mein check karein ke URL sahi aa raha hai ya nahi
// Railway URL ke aakhir mein /api lagana zaroori hai kyunki aapke backend routes wahin se shuru hote hain
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://data-management-system-node-production.up.railway.app/api';

console.log("Axios Base URL in use:", BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor
api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;