import { apiClient } from '@/lib/api-client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<{ success: boolean; data: AuthTokens }>('/auth/login', payload).then((r) => r.data),
};
