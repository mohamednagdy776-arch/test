'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Me {
  id: string;
  email: string;
  accountType: 'user' | 'guardian' | 'agent' | 'admin';
}

async function fetchMe(): Promise<Me> {
  const res = await apiClient.get('/auth/me');
  // Backend wraps payloads as { success, data }.
  return res.data?.data ?? res.data;
}

/**
 * Gates the admin dashboard on an *admin* role — not merely a valid session (#73).
 * The admin app shares the auth cookie with the public web app on the same domain,
 * so any logged-in user previously reached the dashboard by editing the URL. The
 * backend already rejects their API calls with 403, but the UI must not render
 * either. Non-admins (and unauthenticated visitors) are sent to the admin login.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  });

  const isAdmin = data?.accountType === 'admin';

  useEffect(() => {
    if (isLoading) return;
    // A 401 is already handled by the api-client interceptor (redirect to login).
    // Handle the "logged in but not an admin" case (403 / non-admin role) here.
    if (isError || !isAdmin) {
      // Hard navigation bypasses Next.js basePath, so prefix /admin manually.
      window.location.href = '/admin/login?error=forbidden';
    }
  }, [isLoading, isError, isAdmin]);

  if (isLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#EAE0CF]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
