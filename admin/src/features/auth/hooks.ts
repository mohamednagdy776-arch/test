'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, type LoginPayload } from './api';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: () => {
      // Tokens are set as HttpOnly cookies by the backend — nothing to store.
      router.push('/dashboard');
    },
  });
};
