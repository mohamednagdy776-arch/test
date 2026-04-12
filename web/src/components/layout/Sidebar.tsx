'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ─── SVG Icons (Heroicons, strokeWidth 1.5) ──────────────────
const Icons = {
  home: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>,
  search: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>,
  heart: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>,
  group: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>,
  chat: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>,
  user: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>,
  star: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>,
  users: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.367 9.337 9.337 0 001.867-.184m3.691-.207a9.337 9.337 0 011.867.184M12 21.75a9.38 9.38 0 01-2.625-.367m-1.292 7.696a4.5 4.5 0 01-1.248-3.205m0 0a4.5 4.5 0 011.248-3.204m-1.248 7.696a9.38 9.38 0 002.625-.367m-1.292-7.696a9.337 9.337 0 011.867.184M4.5 19.128a9.38 9.38 0 002.625.367M3.375 17.625a9.337 9.337 0 011.867-.184M12 12.75a4.5 4.5 0 01-1.248-3.205m0 0A4.5 4.5 0 0112 12.75m0-4.5a4.5 4.5 0 011.248-3.205m-1.248 7.696a9.38 9.38 0 002.625-.367m-1.292-7.696a9.337 9.337 0 011.867.184"/></svg>,
  flag: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-7.19-5.342a2 2 0 00-1.795 0L3 12.865V3z"/></svg>,
  calendar: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>,
  settings: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/></svg>,
  film: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 1.5a1.125 1.125 0 01-1.125-1.125M18.375 18.375c.621 0 1.125-.504 1.125-1.125m-1.5 0V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125M9 13.5a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z"/></svg>,
  clock: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
};

const navItems = [
  { label: 'الرئيسية', href: '/dashboard', icon: Icons.home },
  { label: 'البحث', href: '/search', icon: Icons.search },
  { label: 'التوافق', href: '/matching', icon: Icons.heart },
  { label: 'الأصدقاء', href: '/friends', icon: Icons.users },
  { label: 'المجتمعات', href: '/groups', icon: Icons.group },
  { label: 'الصفحات', href: '/pages', icon: Icons.flag },
  { label: 'الفعاليات', href: '/events', icon: Icons.calendar },
  { label: 'المحادثات', href: '/chat', icon: Icons.chat },
  { label: 'الذكريات', href: '/memories', icon: Icons.clock },
  { label: 'Watch', href: '/watch', icon: Icons.film },
  { label: 'الملف الشخصي', href: '/profile', icon: Icons.user },
  { label: 'الإعدادات', href: '/settings', icon: Icons.settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="rounded-2xl bg-[#FDFAF5] shadow-card-hover border border-[#C8D8DF]/60 overflow-hidden transition-all duration-300 hover:shadow-glow-lg">
      <div className="p-5 border-b border-[#C8D8DF]/40 bg-gradient-to-r from-[#D4E8EE]/30 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[#FDFAF5] font-bold shadow-glow-primary" style={{ background: 'linear-gradient(135deg, #213448 0%, #547792 100%)' }}>ط</div>
          <div>
            <p className="text-sm font-bold text-[#213448]">لوحة التحكم</p>
            <p className="text-xs text-[#547792] font-medium">مرحباً بك في طيبت</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-soft',
              isActive 
                ? 'bg-gradient-to-r from-[#D4E8EE] to-[#94B4C1]/30 text-[#213448] shadow-soft border border-[#547792]/20' 
                : 'text-[#547792] hover:bg-[#D4E8EE]/50 hover:text-[#213448]'
            )}>
              <span className={cn(
                'transition-all duration-200',
                isActive ? 'text-[#213448] shadow-glow rounded-lg p-1 bg-[#D4E8EE]/50' : 'text-[#94B4C1]'
              )}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#C8D8DF]/40">
        <div className="rounded-xl p-4 shadow-card-hover border border-[#94B4C1]/20 transition-all duration-300 hover:shadow-glow-lg hover:border-[#547792]/30" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #94B4C1 50%, #547792 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#213448] shadow-soft rounded-lg p-1 bg-[#FDFAF5]/50">{Icons.star}</span>
            <p className="text-sm font-bold text-[#213448]">ترقية الحساب</p>
          </div>
          <p className="text-xs text-[#213448]/70 mt-1 font-medium">احصل على ميزات حصرية للتوافق المتقدم</p>
          <button
            onClick={() => router.push('/upgrade')}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#213448] to-[#547792] px-3 py-2 text-xs font-medium text-[#FDFAF5] shadow-soft hover:shadow-glow-primary hover:-translate-y-0.5 transition-all duration-200"
          >
            ترقية الآن
          </button>
        </div>
      </div>
    </div>
  );
};


