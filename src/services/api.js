import axios from 'axios';

// Detect connection type (local vs production)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isProduction
  ? 'https://e-commerse-pazos-vedoya.vercel.app/api/api'  // Cambiar en producción o usar variable de entorno
  : 'http://localhost:8000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// NO interceptor for Bearer token (guest-only app)

export const productsAPI = {
  getAll: (filters = {}) => api.get('/products', { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getGuest: (token, email) => api.get(`/orders/guest/${token}`, { params: { email } }),
  cancelGuest: (token, data) => api.patch(`/orders/guest/${token}/cancel`, data),
};

export default api;
