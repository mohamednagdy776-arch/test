import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  // Send the HttpOnly auth cookies with every request (same-origin). Tokens are
  // no longer kept in localStorage, so this is how the browser authenticates.
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // For file uploads, remove the default JSON Content-Type so the browser/axios
  // sets multipart/form-data WITH the required boundary.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete (config.headers as any)['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // A 401 on the login/auth endpoints means "bad credentials", not "session
    // expired". Let those propagate so the form can show an inline error
    // instead of forcing a full-page redirect that wipes the message.
    const url: string = error.config?.url ?? '';
    const isAuthAttempt = /\/auth\/(login|register|reactivate|2fa\/verify-login)/.test(url);
    if (error.response?.status === 401 && typeof window !== 'undefined' && !isAuthAttempt) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
