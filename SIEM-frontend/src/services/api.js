import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000 // 10 seconds
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API Keys management
export const getApiKeys = async () => {
  const response = await api.get('/api-keys');
  return response.data;
};

export const createApiKey = async (name) => {
  const response = await api.post('/api-keys', { name });
  return response.data;
};

export const revokeApiKey = async (id) => {
  const response = await api.patch(`/api-keys/${id}/revoke`);
  return response.data;
};

export default api;
