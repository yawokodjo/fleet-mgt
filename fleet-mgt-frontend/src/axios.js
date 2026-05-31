import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Base server URL without /api — used for the CSRF cookie endpoint
const SERVER_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // send session cookie + XSRF-TOKEN on every request
  timeout: 10000,
});

// Fetch the CSRF cookie before the first mutating request (login).
// Axios reads XSRF-TOKEN automatically and sends it as X-XSRF-TOKEN.
export const fetchCsrfCookie = () =>
  axios.get(`${SERVER_URL}/sanctum/csrf-cookie`, { withCredentials: true });

// Request interceptor — FormData fix only, no manual token
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — centralised 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || '';
    const isAuth = url.includes('/login') || url.includes('/register');

    // Auth routes: let the component handle all errors (blocked, invalid creds…)
    if (isAuth) return Promise.reject(error);

    if (status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
