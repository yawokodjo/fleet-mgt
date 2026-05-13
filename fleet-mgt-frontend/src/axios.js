import axios from 'axios';

// Configuration de base de l'API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // Timeout de 10 secondes
});

// Intercepteur de requête - Ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log pour debug (à retirer en production)
    console.log('📤 API Request:', config.method.toUpperCase(), config.url, config.params);

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs
api.interceptors.response.use(
  (response) => {
    // Log pour debug (à retirer en production)
    console.log('📥 API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    const status  = error.response?.status;
    const url     = error.config?.url || '';
    const isLogin = url.includes('/login') || url.includes('/register');

    // Routes d'auth : laisser passer toutes les erreurs au composant appelant
    if (isLogin) {
      return Promise.reject(error);
    }

    if (error.response) {
      switch (status) {
        case 401:
          // Session expirée en dehors du login → déconnexion
          console.warn('⚠️ Session expirée');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 403:
          console.error('🚫 Accès interdit');
          break;

        case 422:
          console.error('⚠️ Erreur de validation:', error.response.data?.errors);
          break;

        case 500:
          console.error('💥 Erreur serveur:', error.response.data?.message);
          break;

        default:
          console.error(`❌ Erreur ${status}:`, error.response.data?.message);
      }
    } else if (error.request) {
      console.error('🌐 Aucune réponse du serveur.');
    }

    return Promise.reject(error);
  }
);

export default api;