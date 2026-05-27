import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

// Automatically prepend /api to all requests
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/')) {
    config.url = '/api' + config.url;
  } else if (config.url && !config.url.startsWith('http')) {
    config.url = '/api/' + config.url;
  }
  return config;
});

export default api;
