import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  config.headers['X-Request-Id'] = requestId;
  return config;
});

export default api;
