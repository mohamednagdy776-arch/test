'use client';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const router = useRouter();
  const handleLogout = () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); router.push('/login'); };
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-2">
        <div className="status-online" />
        <span className="text-sm font-medium text-emerald-600">System Online</span>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-300 transition-all duration-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
        Logout
      </button>
    </header>
  );
};
