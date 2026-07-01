import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ;
const isDebug = import.meta.env.VITE_API_DEBUG === 'true';

if (isDebug) {
  console.log('🔧 [API Config] Base URL:', baseURL);
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Log des requêtes en mode debug
api.interceptors.request.use((config) => {
  if (isDebug) {
    console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Intercepteur pour rafraîchir automatiquement le token en cas d'erreur 401
api.interceptors.response.use(
  (response) => {
    if (isDebug) {
      console.log(`📥 [API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const isRefreshRequest = originalRequest.url === '/auth/refresh';
    const errorMessage = error.response?.data?.message || error.message || 'Erreur API';

    if (isDebug) {
      console.error(`❌ [API Error] ${error.response?.status || 'No Status'} - ${errorMessage}`);
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // rediriger vers login
        if (typeof window !== 'undefined') {
          window.location.href = '/connexion';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

