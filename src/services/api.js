import axios from 'axios';

// Detect connection type (local vs production)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// In production on Vercel, the double prefix /api/api is required due to routing issues
export const API_BASE_URL = isProduction
  ? 'https://e-commerse-pazos-vedoya.vercel.app/api/api'
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
