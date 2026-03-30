'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary">طيبت</Link>
        <div className="flex items-center gap-4">
          <Link href="/matching" className="text-sm text-gray-600 hover:text-primary">التوافق</Link>
          <Link href="/groups" className="text-sm text-gray-600 hover:text-primary">المجتمعات</Link>
          <Link href="/chat" className="text-sm text-gray-600 hover:text-primary">المحادثات</Link>
          <Link href="/profile" className="text-sm text-gray-600 hover:text-primary">الملف</Link>
          <button onClick={logout} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            خروج
          </button>
        </div>
      </div>
    </nav>
  );
};
