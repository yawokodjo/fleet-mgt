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
    console.error('❌ Response Error:', error.response?.status, error.message);

    // Gérer les erreurs spécifiques
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token invalide ou expiré
          console.warn('⚠️ Session expirée, redirection vers login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 403:
          console.error('🚫 Accès interdit');
          alert('Vous n\'avez pas les permissions nécessaires.');
          break;

        case 404:
          console.error('🔍 Ressource non trouvée');
          break;

        case 422:
          // Erreurs de validation Laravel
          console.error('⚠️ Erreur de validation:', data.errors);
          break;

        case 500:
          console.error('💥 Erreur serveur:', data.message);
          alert('Erreur serveur. Vérifiez la console pour plus de détails.');
          break;

        default:
          console.error(`❌ Erreur ${status}:`, data.message);
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      console.error('🌐 Aucune réponse du serveur. Vérifiez que le backend Laravel est en cours d\'exécution.');
      alert('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } else {
      // Erreur lors de la configuration de la requête
      console.error('⚙️ Erreur de configuration:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;