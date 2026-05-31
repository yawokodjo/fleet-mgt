import axios from 'axios';

const API_URL    = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SERVER_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Fetch the CSRF cookie from Laravel before the first login POST.
export const fetchCsrfCookie = () =>
  axios.get(`${SERVER_URL}/sanctum/csrf-cookie`, { withCredentials: true });

// Request interceptor:
// - Same-domain (dev): XSRF-TOKEN cookie → X-XSRF-TOKEN header (session mode)
// - Cross-domain (prod): Bearer token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      config.headers['Authorization'] = `Bearer ${sessionToken}`;
    } else {
      const xsrf = getCookie('XSRF-TOKEN');
      if (xsrf) config.headers['X-XSRF-TOKEN'] = xsrf;
    }

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

    if (isAuth) return Promise.reject(error);

    if (status === 401) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isPublic = publicRoutes.some(r => window.location.pathname.startsWith(r));
      if (!isPublic) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
