'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, token: null });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setAuth({ isAuthenticated: !!token, token });
  }, []);

  const login = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setAuth({ isAuthenticated: true, token: accessToken });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuth({ isAuthenticated: false, token: null });
    router.push('/login');
  }, [router]);

  return { ...auth, login, logout };
}
