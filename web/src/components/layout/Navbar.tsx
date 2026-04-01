'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ─── SVG Icons (Heroicons, strokeWidth 1.5 — same as Sidebar) ─
const Icons = {
  home: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>,
  search: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>,
  heart: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>,
  group: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>,
  chat: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>,
  user: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>,
  bell: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>,
  logout: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>,
  menu: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>,
  close: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
};

const navLinks = [
  { href: '/matching', label: 'التوافق', icon: Icons.heart },
  { href: '/search', label: 'البحث', icon: Icons.search },
  { href: '/groups', label: 'المجتمعات', icon: Icons.group },
  { href: '/chat', label: 'المحادثات', icon: Icons.chat },
];

// ─── Notification Dropdown ────────────────────────────────────
function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = [
    { id: 1, type: 'match', icon: '💖', text: 'توافق جديد مع سارة أحمد', time: 'منذ 5 دقائق' },
    { id: 2, type: 'message', icon: '💬', text: 'رسالة جديدة من يوسف محمد', time: 'منذ 15 دقيقة' },
    { id: 3, type: 'like', icon: '👍', text: 'أعجب أحمد بمنشورك', time: 'منذ ساعة' },
    { id: 4, type: 'system', icon: '🔔', text: 'تم تأهيل ملفك الشخصي', time: 'منذ 3 ساعات' },
  ];

  return (
    <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-[#FDFAF5] shadow-elevated border border-[#C8D8DF]/60 overflow-hidden animate-slide-down z-50">
      <div className="px-4 py-3 border-b border-[#C8D8DF]/40 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#213448]">الإشعارات</h3>
        <button onClick={onClose} className="text-[#547792] hover:text-[#213448]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.map((n) => (
          <button key={n.id} className="w-full text-right flex items-start gap-3 px-4 py-3 hover:bg-[#D4E8EE]/50 transition-colors border-b border-[#C8D8DF]/20 last:border-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-[#D4E8EE] flex items-center justify-center text-lg">
              {n.type === 'match' ? Icons.heart : n.type === 'message' ? Icons.chat : n.type === 'like' ? Icons.user : Icons.bell}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#131F2E] leading-relaxed">{n.text}</p>
              <p className="text-[11px] text-[#BFB9AD] mt-0.5">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-[#C8D8DF]/40">
        <button className="w-full text-center text-xs font-semibold text-[#547792] hover:text-[#213448] transition-colors">
          عرض جميع الإشعارات
        </button>
      </div>
    </div>
  );
}

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const logout = () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); router.push('/login'); };

  return (
    <nav className="sticky top-0 z-40 border-b border-[#C8D8DF]/60 bg-[#213448]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[#FDFAF5] font-bold text-sm" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>ط</div>
          <span className="text-xl font-bold text-[#FDFAF5] group-hover:text-[#94B4C1] transition-colors">طيبت</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              pathname === link.href ? 'bg-[#547792]/30 text-[#EAE0CF]' : 'text-[#94B4C1] hover:text-[#EAE0CF] hover:bg-[#547792]/20'
            )}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-[#94B4C1] hover:text-[#EAE0CF] hover:bg-[#547792]/20 transition-all duration-200"
            >
              {Icons.bell}
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#B05252] ring-2 ring-[#213448]" />
            </button>
            {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
          </div>

          {/* Profile icon */}
          <Link href="/profile" className={cn(
            'rounded-lg p-2 transition-all duration-200',
            pathname === '/profile' ? 'text-[#EAE0CF] bg-[#547792]/30' : 'text-[#94B4C1] hover:text-[#EAE0CF] hover:bg-[#547792]/20'
          )}>
            {Icons.user}
          </Link>

          {/* Logout */}
          <button onClick={logout} className="flex items-center gap-1.5 rounded-lg border border-[#547792]/30 px-3 py-2 text-sm font-medium text-[#94B4C1] hover:bg-[#547792]/20 hover:text-[#EAE0CF] transition-all duration-200">
            {Icons.logout}
            <span className="hidden lg:inline">خروج</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-[#94B4C1] hover:bg-[#547792]/20 transition-colors">
          {mobileOpen ? Icons.close : Icons.menu}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#547792]/30 bg-[#131F2E] animate-slide-down">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href ? 'bg-[#547792]/30 text-[#EAE0CF]' : 'text-[#94B4C1] hover:bg-[#547792]/20'
              )}>
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setMobileOpen(false)} className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === '/profile' ? 'bg-[#547792]/30 text-[#EAE0CF]' : 'text-[#94B4C1] hover:bg-[#547792]/20'
            )}>
              {Icons.user} الملف الشخصي
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-2 text-right px-3 py-2.5 rounded-lg text-sm font-medium text-[#B05252] hover:bg-[#B05252]/10 transition-colors">
              {Icons.logout} خروج
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
