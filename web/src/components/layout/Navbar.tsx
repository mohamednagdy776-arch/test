'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/matching', label: 'التوافق' },
  { href: '/search', label: 'البحث' },
  { href: '/groups', label: 'المجتمعات' },
  { href: '/chat', label: 'المحادثات' },
  { href: '/profile', label: 'الملف' },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); router.push('/login'); };

  return (
    <nav className="sticky top-0 z-40 border-b border-[#C8D8DF]/60 bg-[#213448]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[#FDFAF5] font-bold text-sm" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>ط</div>
          <span className="text-xl font-bold text-[#FDFAF5] group-hover:text-[#94B4C1] transition-colors">طيبت</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              pathname === link.href ? 'bg-[#547792]/30 text-[#EAE0CF]' : 'text-[#94B4C1] hover:text-[#EAE0CF] hover:bg-[#547792]/20'
            )}>{link.label}</Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={logout} className="flex items-center gap-1.5 rounded-lg border border-[#547792]/30 px-3 py-2 text-sm font-medium text-[#94B4C1] hover:bg-[#547792]/20 hover:text-[#EAE0CF] transition-all duration-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            خروج
          </button>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-[#94B4C1] hover:bg-[#547792]/20 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-[#547792]/30 bg-[#131F2E] animate-slide-down">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn(
                'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href ? 'bg-[#547792]/30 text-[#EAE0CF]' : 'text-[#94B4C1] hover:bg-[#547792]/20'
              )}>{link.label}</Link>
            ))}
            <button onClick={logout} className="w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium text-[#B05252] hover:bg-[#B05252]/10 transition-colors">خروج</button>
          </div>
        </div>
      )}
    </nav>
  );
};
