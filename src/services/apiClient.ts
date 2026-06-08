import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // MANDATORY: Required to send/receive HttpOnly Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Transitioning to Cookies
apiClient.interceptors.request.use(
  (config) => {
    // In production, the browser will automatically append the 'mg_auth' cookie.
    // Legacy token logic removed to prevent conflicts with HttpOnly cookies.

    // Handle File Uploads (Multipart)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
        if (import.meta.env.DEV) console.warn('API returned 401 Unauthorized. Session expired or account revoked.');
        localStorage.removeItem('token');
    }
    
    if (import.meta.env.DEV) {
        console.error('API Error:', error.response?.data?.message || error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export const BASE_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || '';
export const BASE_URL = import.meta.env.VITE_API_URL || '/api';
