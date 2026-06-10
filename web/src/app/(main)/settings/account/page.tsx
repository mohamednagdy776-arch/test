'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Profile editing now lives only on the profile page. This route redirects
// there so any old links keep working.
export default function AccountPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
}
