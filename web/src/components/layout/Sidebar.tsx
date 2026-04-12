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
          const Icon = item.icon;
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
              )}><Icon size={20} weight={isActive ? 'fill' : 'regular'} /></span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#C8D8DF]/40">
        <div className="rounded-xl p-4 shadow-card-hover border border-[#94B4C1]/20 transition-all duration-300 hover:shadow-glow-lg hover:border-[#547792]/30" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #94B4C1 50%, #547792 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#213448] shadow-soft rounded-lg p-1 bg-[#FDFAF5]/50"><Star size={20} weight="fill" /></span>
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