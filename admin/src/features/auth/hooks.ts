'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, type LoginPayload } from './api';
import { apiClient } from '@/lib/api-client';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      await authApi.login(payload);
      // Credentials alone aren't enough for the admin panel — confirm the account
      // is actually an admin (#73). If not, tear the session back down so a
      // non-admin never holds an admin-app session, and surface a clear error.
      const me = await apiClient.get('/auth/me');
      const accountType = me.data?.data?.accountType ?? me.data?.accountType;
      if (accountType !== 'admin') {
        await apiClient.post('/auth/logout').catch(() => {});
        throw new Error('This account does not have administrator access.');
      }
    },
    onSuccess: () => {
      // Tokens are set as HttpOnly cookies by the backend — nothing to store.
      router.push('/dashboard');
    },
  });
};
