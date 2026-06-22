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
  House, Heart, MagnifyingGlass, UsersThree, UsersFour, ChatCircle,
  SignOut, List, X, User, CaretDown, CalendarBlank, Crown,
  UsersThree as Friends, ShieldCheck, BookmarkSimple, Clock,
  PlayCircle, FilmStrip, Baby, TestTube, ShareNetwork, Gear,
} from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

const navLinks = [
  { href: '/dashboard', label: 'الرئيسية', icon: House },
  { href: '/matching', label: 'التوافق', icon: Heart },
  { href: '/search', label: 'البحث', icon: MagnifyingGlass },
  { href: '/groups', label: 'المجتمعات', icon: UsersFour },
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
      <nav
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: 'color-mix(in srgb, var(--card) 90%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          boxShadow: '0 1px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
        }}
      >
        <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between px-3 sm:px-6">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl font-black text-sm shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: 'var(--primary-foreground)',
                boxShadow: '0 2px 12px rgba(184,137,42,0.3)',
              }}
            >
              ط
            </div>
            <span
              className="hidden sm:block text-lg font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 20%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              طيبت
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group min-w-[56px]',
                  )}
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                    background: isActive ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                      (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--primary) 6%, transparent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
                      (e.currentTarget as HTMLElement).style.background = '';
                    }
                  }}
                >
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} className="transition-transform duration-200 group-hover:scale-110" />
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(184,137,42,0.6)' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop right side (lg+) */}
          <div className="hidden lg:flex items-center gap-2">
            <NotificationBell />

            <Link
              href="/upgrade"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #D4A853 100%)',
                color: '#0A3D2B',
                boxShadow: '0 2px 10px rgba(184,137,42,0.35)',
              }}
            >
              <Crown size={14} weight="fill" />
              مميز
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200"
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = ''}
            >
              <div className="relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-xl object-cover"
                    style={{ boxShadow: '0 0 0 2px var(--accent), 0 0 0 4px rgba(184,137,42,0.2)' }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      color: 'var(--primary-foreground)',
                      boxShadow: '0 2px 8px rgba(184,137,42,0.3)',
                    }}
                  >
                    {displayName.charAt(0)}
                  </div>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: '#22c55e', borderColor: 'var(--card)', boxShadow: '0 0 5px rgba(34,197,94,0.5)' }}
                />
              </div>
              <span className="hidden 2xl:block text-xs font-semibold max-w-[80px] truncate" style={{ color: 'var(--foreground)' }}>
                {displayName}
              </span>
              <CaretDown size={11} className="hidden 2xl:block" style={{ color: 'var(--muted-foreground)' }} />
            </Link>

            <button
              onClick={logout}
              className="flex items-center p-2 rounded-xl transition-all duration-200"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(160,48,48,0.08)';
                (e.currentTarget as HTMLElement).style.color = '#E05050';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '';
                (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
              }}
              aria-label="تسجيل الخروج"
            >
              <SignOut size={18} />
            </button>
          </div>

          {/* Mobile + tablet (below lg) — notification bell + hamburger for secondary features */}
          <div className="flex lg:hidden items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl transition-all duration-200"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = ''}
              aria-label="القائمة"
            >
              {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Mobile + tablet drawer (hidden on lg+ where sidebar handles navigation) */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t animate-slide-down overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'color-mix(in srgb, var(--accent) 20%, var(--border))' }}
          >
            {/* User strip */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} width={36} height={36} className="w-9 h-9 rounded-xl object-cover" style={{ boxShadow: '0 0 0 2px var(--accent)' }} />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}
                >
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{displayName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>مرحباً بك في طيبت</p>
              </div>
            </div>

            {/* Secondary features — not in the bottom nav */}
            <div className="p-3 grid grid-cols-4 gap-1">
              {[
                { href: '/friends',          label: 'الأصدقاء',   icon: UsersThree },
                { href: '/family',           label: 'العائلة',    icon: ShieldCheck },
                { href: '/events',           label: 'الفعاليات',  icon: CalendarBlank },
                { href: '/groups',           label: 'المجتمعات',  icon: UsersFour },
                { href: '/saved',            label: 'المحفوظات',  icon: BookmarkSimple },
                { href: '/memories',         label: 'الذكريات',   icon: Clock },
                { href: '/reels',            label: 'ريلز',       icon: FilmStrip },
                { href: '/watch',            label: 'Watch',      icon: PlayCircle },
                { href: '/child-prediction', label: 'التوقع',     icon: Baby },
                { href: '/lab-portal',       label: 'المختبرات',  icon: TestTube },
                { href: '/affiliates',       label: 'الإحالة',    icon: ShareNetwork },
                { href: '/settings',         label: 'الإعدادات',  icon: Gear },
              ].map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                      background: isActive ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : undefined,
                    }}
                  >
                    <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="px-3 pb-3 flex gap-2">
              <Link
                href="/upgrade"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, #D4A853 100%)',
                  color: '#0A3D2B',
                  boxShadow: '0 2px 10px rgba(184,137,42,0.3)',
                }}
              >
                <Crown size={16} weight="fill" />
                ترقية الحساب
              </Link>
              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                <SignOut size={16} />
                خروج
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
