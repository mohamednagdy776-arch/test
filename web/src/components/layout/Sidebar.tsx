'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useMyProfile } from '@/features/profile/hooks';
import {
  House, MagnifyingGlass, Heart, UsersThree, User, Flag,
  CalendarBlank, ChatCircle, Gear, Clock, PlayCircle, FilmStrip,
  ShieldCheck, ShareNetwork, TestTube, Baby, Sparkle, SignOut,
  Star, BookmarkSimple,
} from '@phosphor-icons/react';
import { authApi } from '@/features/auth/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { label: 'الرئيسية', href: '/dashboard', icon: House },
      { label: 'البحث', href: '/search', icon: MagnifyingGlass },
      { label: 'المحادثات', href: '/chat', icon: ChatCircle },
      { label: 'المحفوظات', href: '/saved', icon: BookmarkSimple },
    ],
  },
  {
    label: 'التواصل',
    items: [
      { label: 'التوافق', href: '/matching', icon: Heart },
      { label: 'الأصدقاء', href: '/friends', icon: UsersThree },
      { label: 'العائلة', href: '/family', icon: ShieldCheck },
      { label: 'الفعاليات', href: '/events', icon: CalendarBlank },
      { label: 'المجتمعات', href: '/groups', icon: UsersThree },
      { label: 'الصفحات', href: '/pages', icon: Flag },
    ],
  },
  {
    label: 'المحتوى',
    items: [
      { label: 'الذكريات', href: '/memories', icon: Clock },
      { label: 'Watch', href: '/watch', icon: PlayCircle },
      { label: 'ريلز', href: '/reels', icon: FilmStrip },
    ],
  },
  {
    label: 'المميز',
    items: [
      { label: 'توقع شكل طفلك', href: '/child-prediction', icon: Baby },
      { label: 'بوابة المختبرات', href: '/lab-portal', icon: TestTube },
      { label: 'برنامج الإحالة', href: '/affiliates', icon: ShareNetwork },
    ],
  },
  {
    label: 'الحساب',
    items: [
      { label: 'الملف الشخصي', href: '/profile', icon: User },
      { label: 'الإعدادات', href: '/settings', icon: Gear },
    ],
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profileData } = useMyProfile();
  const user = (profileData as any)?.data;
  const avatarUrl = user?.avatar ? `${API_BASE}${user.avatar}` : null;
  const displayName = user?.name || user?.username || 'المستخدم';
  const username = user?.username ? `@${user.username}` : '';

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    router.push('/login');
  };

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.6) inset',
        maxHeight: 'calc(100vh - 5.5rem)',
      }}>

      {/* User profile card */}
      <Link href="/profile"
        className="flex items-center gap-3 p-4 border-b transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] group"
        style={{ borderColor: 'var(--border)' }}>
        <div className="relative shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} width={44} height={44}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-[var(--primary)] ring-offset-1" />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
              {displayName.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#22c55e' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--foreground)' }}>
            {displayName}
          </p>
          {username && (
            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{username}</p>
          )}
        </div>
        <div className="shrink-0 w-1.5 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to bottom, var(--primary), var(--accent))' }} />
      </Link>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group relative',
                    isActive
                      ? 'font-semibold'
                      : 'hover:translate-x-0.5'
                  )}
                  style={
                    isActive
                      ? {
                          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                          color: 'var(--primary)',
                        }
                      : { color: 'var(--muted-foreground)' }
                  }
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-l-full"
                      style={{ background: 'var(--primary)' }} />
                  )}
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Logout */}
        <button onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-red-50 hover:text-red-500 mt-1"
          style={{ color: 'var(--muted-foreground)' }}>
          <SignOut size={18} className="shrink-0" />
          تسجيل الخروج
        </button>
      </nav>

      {/* Premium upgrade banner */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/upgrade')}
          className="w-full rounded-xl p-3.5 text-right transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 60%, #f59e0b 100%)',
            color: 'var(--primary-foreground)',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--primary) 40%, transparent)',
          }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkle size={16} weight="fill" className="text-yellow-300 group-hover:rotate-12 transition-transform" />
            <Star size={14} weight="fill" className="text-yellow-300 opacity-70" />
            <span className="text-sm font-bold">ترقية الحساب</span>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">احصل على توافق متقدم، فلاتر حصرية، وميزات مميزة</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold opacity-90">
            <span>ابدأ الآن مجاناً</span>
            <span className="text-base leading-none">←</span>
          </div>
        </button>
      </div>
    </div>
  );
};
