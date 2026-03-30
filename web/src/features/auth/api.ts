import { apiClient } from '@/lib/api-client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data),

  register: (email: string, phone: string, password: string) =>
    apiClient.post('/auth/register', { email, phone, password }).then((r) => r.data),
};
