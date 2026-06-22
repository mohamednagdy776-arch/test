'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useMyProfile } from '@/features/profile/hooks';
import {
  House, MagnifyingGlass, Heart, UsersThree, UsersFour, User, Flag,
  CalendarBlank, ChatCircle, Gear, Clock, PlayCircle, FilmStrip,
  ShieldCheck, ShareNetwork, TestTube, Baby, Sparkle, SignOut,
  BookmarkSimple, Crown, Bell,
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
      { label: 'الإشعارات', href: '/notifications', icon: Bell },
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
      { label: 'المجتمعات', href: '/groups', icon: UsersFour },
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
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--sidebar-bg)',
        border: '1px solid var(--sidebar-border)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.04) inset',
        maxHeight: 'calc(100vh - 5.5rem)',
      }}
    >
      {/* User profile card */}
      <Link
        href="/profile"
        className="flex items-center gap-3 p-4 transition-all duration-200 group"
        style={{
          borderBottom: '1px solid var(--sidebar-divider)',
          background: 'var(--sidebar-user-bg)',
        }}
      >
        <div className="relative shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={44}
              height={44}
              className="w-11 h-11 rounded-xl object-cover"
              style={{ boxShadow: '0 0 0 2px #B8892A, 0 0 0 4px rgba(184,137,42,0.25)' }}
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold"
              style={{
                background: 'linear-gradient(135deg, #B8892A 0%, #E8C57A 100%)',
                color: '#091F16',
                boxShadow: '0 2px 12px rgba(184,137,42,0.4)',
              }}
            >
              {displayName.charAt(0)}
            </div>
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
            style={{ background: '#22c55e', border: '2px solid #091F16', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold truncate transition-colors"
            style={{ color: 'var(--sidebar-active-fg)' }}
          >
            {displayName}
          </p>
          {username && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--sidebar-fg)' }}>
              {username}
            </p>
          )}
        </div>
        <div
          className="shrink-0 w-1.5 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to bottom, #B8892A, #E8C57A)' }}
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p
              className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--sidebar-label)' }}
            >
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive ? 'font-semibold' : 'hover:translate-x-[-1px]'
                  )}
                  style={
                    isActive
                      ? { background: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-fg)' }
                      : { color: 'var(--sidebar-fg)' }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = '';
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l-full"
                      style={{ background: '#B8892A', boxShadow: '0 0 8px rgba(184,137,42,0.6)' }}
                    />
                  )}
                  <Icon
                    size={17}
                    weight={isActive ? 'fill' : 'regular'}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Divider */}
        <div className="my-1 mx-2 h-px" style={{ background: 'var(--sidebar-divider)' }} />

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200"
          style={{ color: 'var(--sidebar-fg)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(160,48,48,0.15)';
            (e.currentTarget as HTMLElement).style.color = '#F08080';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '';
            (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-fg)';
          }}
        >
          <SignOut size={17} className="shrink-0" />
          تسجيل الخروج
        </button>
      </nav>

      {/* Premium upgrade banner */}
      <div className="p-3" style={{ borderTop: '1px solid var(--sidebar-divider)' }}>
        <button
          onClick={() => router.push('/upgrade')}
          className="w-full rounded-xl p-3.5 text-right transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(184,137,42,0.25) 0%, rgba(10,61,43,0.4) 50%, rgba(184,137,42,0.2) 100%)',
            border: '1px solid rgba(184,137,42,0.35)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(184,137,42,0.15) inset',
          }}
        >
          {/* Gold shimmer */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(232,197,122,0.1) 0%, transparent 60%)' }}
          />
          <div className="relative flex items-center gap-2 mb-1.5">
            <Crown size={15} weight="fill" style={{ color: '#E8C57A' }} />
            <span className="text-sm font-bold" style={{ color: '#E8C57A' }}>ترقية الحساب</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#7DAC8D' }}>
            احصل على توافق متقدم وفلاتر حصرية
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold" style={{ color: '#B8892A' }}>
            <Sparkle size={12} weight="fill" />
            <span>ابدأ الآن مجاناً</span>
            <span className="mr-auto text-base leading-none">←</span>
          </div>
        </button>
      </div>
    </div>
  );
};
