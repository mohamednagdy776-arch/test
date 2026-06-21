'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { authApi } from '@/features/auth/api';
import { useMyProfile } from '@/features/profile/hooks';
import {
  House, Heart, MagnifyingGlass, UsersThree, ChatCircle,
  SignOut, List, X, User, CaretDown, CalendarBlank, Sparkle
} from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: House },
  { href: '/matching', label: 'التوافق', icon: Heart },
  { href: '/search', label: 'البحث', icon: MagnifyingGlass },
  { href: '/groups', label: 'المجتمعات', icon: UsersThree },
  { href: '/events', label: 'الفعاليات', icon: CalendarBlank },
  { href: '/chat', label: 'المحادثات', icon: ChatCircle },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: profileData } = useMyProfile();
  const user = (profileData as any)?.data;
  const avatarUrl = user?.avatar ? `${API_BASE}${user.avatar}` : null;
  const displayName = user?.name || user?.username || 'حسابي';

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    router.push('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b transition-all duration-300"
        style={{
          background: 'color-mix(in srgb, var(--card) 85%, transparent)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 1px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.4) inset',
        }}
      >
        <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between px-3 sm:px-6">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-sm shadow-md transition-transform duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'var(--primary-foreground)' }}>
              ط
            </div>
            <span className="hidden sm:block text-lg font-extrabold tracking-tight transition-colors"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              طيبت
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group min-w-[56px]',
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--primary)]'
                  )}
                  style={isActive ? { background: 'color-mix(in srgb, var(--primary) 10%, transparent)' } : {}}
                >
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'}
                    className="transition-transform duration-200 group-hover:scale-110" />
                  {label}
                  {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell />

            {/* Upgrade badge */}
            <Link href="/upgrade"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
              <Sparkle size={14} weight="fill" />
              ترقية
            </Link>

            {/* User avatar dropdown */}
            <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]">
              <div className="relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName} width={32} height={32}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-[var(--primary)] ring-offset-1" />
                ) : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
                    {displayName.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: '#22c55e' }} />
              </div>
              <span className="hidden xl:block text-xs font-semibold max-w-[80px] truncate" style={{ color: 'var(--foreground)' }}>
                {displayName}
              </span>
              <CaretDown size={12} className="hidden xl:block opacity-50" />
            </Link>

            <button onClick={logout}
              className="flex items-center gap-1 px-2 py-2 rounded-xl text-xs transition-all duration-200 hover:bg-red-50 hover:text-red-500"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label="تسجيل الخروج">
              <SignOut size={18} />
            </button>
          </div>

          {/* Mobile: notification + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: 'var(--primary)' }}
              aria-label="القائمة">
              {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t animate-slide-down overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            {/* User info strip */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} width={36} height={36} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{displayName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>مرحباً بك في طيبت</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 p-3">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-semibold transition-all duration-200',
                      isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    )}
                    style={isActive ? { background: 'color-mix(in srgb, var(--primary) 10%, transparent)' } : {}}>
                    <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                    {label}
                  </Link>
                );
              })}
              <Link href="/profile" onClick={() => setMobileOpen(false)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{ color: 'var(--muted-foreground)' }}>
                <User size={22} />
                الملف
              </Link>
            </div>

            <div className="px-3 pb-3 flex gap-2">
              <Link href="/upgrade" onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                <Sparkle size={16} weight="fill" /> ترقية الحساب
              </Link>
              <button onClick={() => { setMobileOpen(false); logout(); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                <SignOut size={16} /> خروج
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
