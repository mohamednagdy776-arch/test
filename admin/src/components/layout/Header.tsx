'use client';

import { useRouter } from 'next/navigation';

export const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Admin</span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
