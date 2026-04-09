import { apiClient } from '@/lib/api-client';

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user?: any;
    requiresTwoFactor?: boolean;
    userId?: string;
    qrCode?: string;
    secret?: string;
    twoFactorEnabled?: boolean;
  };
}

interface Session {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  isActive: boolean;
}

interface SessionsResponse {
  success: boolean;
  message?: string;
  data: Session[];
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  dateOfBirth?: string;
  gender?: string;
}

export const authApi = {
  login: async (email: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', { email, password, rememberMe });
    return res.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/verify-email', { token });
    return res.data;
  },

  resendVerification: async (email: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/resend-verification', { email });
    return res.data;
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/reset-password', { token, password });
    return res.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  getSessions: async (): Promise<SessionsResponse> => {
    const res = await apiClient.get('/auth/sessions');
    return res.data;
  },

  revokeSession: async (sessionId: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/sessions/revoke', { sessionId });
    return res.data;
  },

  revokeAllSessions: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/sessions/revoke', { all: true });
    return res.data;
  },

  setup2FA: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/2fa/setup');
    return res.data;
  },

  verify2FA: async (code: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/2fa/verify', { code });
    return res.data;
  },

  disable2FA: async (code: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/2fa/disable', { code });
    return res.data;
  },

  verifyLogin2FA: async (userId: string, code: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/2fa/verify-login', { userId, code });
    return res.data;
  },

  deactivate: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/deactivate');
    return res.data;
  },

  reactivate: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/reactivate', { email, password });
    return res.data;
  },

  deleteAccount: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/delete');
    return res.data;
  },

  cancelDeletion: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/delete/cancel');
    return res.data;
  },

  exportData: async (): Promise<AuthResponse> => {
    const res = await apiClient.get('/auth/export');
    return res.data;
  },
};
