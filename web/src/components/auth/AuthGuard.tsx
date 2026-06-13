'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // The JWT is in an HttpOnly cookie (unreadable here). The backend also sets
    // a readable `uid` cookie on login, so its presence signals an active
    // session. Server-side middleware is the real gate; this avoids a flash of
    // protected UI for logged-out users.
    const hasSession = document.cookie
      .split('; ')
      .some((row) => row.startsWith('uid='));
    if (!hasSession) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
