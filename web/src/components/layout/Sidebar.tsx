'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { House, MagnifyingGlass, Heart, UsersThree, User, Flag, CalendarBlank, ChatCircle, Gear, Star, Clock, PlayCircle, ShareNetwork } from '@phosphor-icons/react';

const navItems = [
  { label: 'الرئيسية', href: '/dashboard', icon: House },
  { label: 'البحث', href: '/search', icon: MagnifyingGlass },
  { label: 'التوافق', href: '/matching', icon: Heart },
  { label: 'الأصدقاء', href: '/friends', icon: UsersThree },
  { label: 'المجتمعات', href: '/groups', icon: UsersThree },
  { label: 'الصفحات', href: '/pages', icon: Flag },
  { label: 'الفعاليات', href: '/events', icon: CalendarBlank },
  { label: 'المحادثات', href: '/chat', icon: ChatCircle },
  { label: 'الذكريات', href: '/memories', icon: Clock },
  { label: 'Watch', href: '/watch', icon: PlayCircle },
  { label: 'الإحالة', href: '/affiliates', icon: ShareNetwork },
  { label: 'الملف الشخصي', href: '/profile', icon: User },
  { label: 'الإعدادات', href: '/settings', icon: Gear },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="rounded-3xl shadow-soft overflow-hidden transition-all duration-300"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid var(--border)' }}
    >
      <div
        className="p-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl font-bold text-base"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            ط
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>لوحة التحكم</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>مرحباً بك في طيبت</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'hover:-translate-y-0.5'
              )}
              style={
                isActive
                  ? { backgroundColor: 'var(--muted)', color: 'var(--primary)', fontWeight: 600 }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="rounded-2xl p-4 transition-all duration-300"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Star size={18} weight="fill" />
            <p className="text-sm font-bold">ترقية الحساب</p>
          </div>
          <p className="text-xs opacity-80 mt-1">احصل على ميزات حصرية للتوافق المتقدم</p>
          <button
            onClick={() => router.push('/upgrade')}
            className="mt-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-foreground)', color: 'var(--primary)' }}
          >
            ترقية الآن
          </button>
        </div>
      </div>
    </div>
  );
};
