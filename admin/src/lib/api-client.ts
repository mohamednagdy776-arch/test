import axios from 'axios';

// Centralized Axios instance — all API calls go through here
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  // Auth is via HttpOnly cookies set by the backend; send them with each call.
  withCredentials: true,
});

// Handle 401 globally — redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      // Hard navigation bypasses Next.js basePath, so prefix /admin manually.
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
