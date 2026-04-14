'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { House, MagnifyingGlass, Heart, UsersThree, User, Flag, CalendarBlank, ChatCircle, Gear, Star, Clock, Funnel, PlayCircle } from '@phosphor-icons/react';

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
  { label: 'الملف الشخصي', href: '/profile', icon: User },
  { label: 'الإعدادات', href: '/settings', icon: Gear },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-5 border-b border-[#DCFCE7]/40 bg-gradient-to-r from-[#DCFCE7]/30 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#FFFBEB] font-bold shadow-soft" style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>ط</div>
          <div>
            <p className="text-sm font-bold text-[#059669]">لوحة التحكم</p>
            <p className="text-xs text-[#6EE7B7] font-medium">مرحباً بك في طيبت</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-soft',
              isActive 
                ? 'bg-gradient-to-r from-[#DCFCE7] to-[#A7F3D0]/30 text-[#059669] shadow-soft border border-[#10B981]/20' 
                : 'text-[#10B981] hover:bg-[#DCFCE7]/50 hover:text-[#059669]'
            )}>
              <span className={cn(
                'transition-all duration-200',
                isActive ? 'text-[#059669] shadow-soft rounded-xl p-1 bg-[#DCFCE7]/50' : 'text-[#6EE7B7]'
              )}><Icon size={20} weight={isActive ? 'fill' : 'regular'} /></span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#DCFCE7]/40">
        <div className="rounded-2xl p-4 shadow-soft border border-[#FCD34D]/20 transition-all duration-300 hover:shadow-lg hover:border-[#F59E0B]/30" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #A7F3D0 50%, #34D399 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#059669] shadow-soft rounded-xl p-1 bg-[#FFFBEB]/50"><Star size={20} weight="fill" /></span>
            <p className="text-sm font-bold text-[#064E3B]">ترقية الحساب</p>
          </div>
          <p className="text-xs text-[#065F46]/70 mt-1 font-medium">احصل على ميزات حصرية للتوافق المتقدم</p>
          <button
            onClick={() => router.push('/upgrade')}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] px-3 py-2 text-xs font-medium text-[#FFFBEB] shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            ترقية الآن
          </button>
        </div>
      </div>
    </div>
  );
};