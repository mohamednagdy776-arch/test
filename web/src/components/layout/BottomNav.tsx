'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Heart, ChatCircle, MagnifyingGlass, User } from '@phosphor-icons/react';
import { useT } from '@/i18n/I18nProvider';

const tabs = [
  { href: '/dashboard',  labelKey: 'nav.home',         icon: House },
  { href: '/matching',   labelKey: 'nav.matching',     icon: Heart },
  { href: '/chat',       labelKey: 'nav.messages',     icon: ChatCircle },
  { href: '/search',     labelKey: 'nav.search',       icon: MagnifyingGlass },
  { href: '/profile',    labelKey: 'nav.profileShort', icon: User },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: 'var(--sidebar-bg)',
        borderTop: '1px solid rgba(184,137,42,0.22)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.28)',
      }}
    >
      <div className="flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-200 min-h-[56px]"
              style={{ color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg)' }}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full"
                  style={{ background: '#B8892A', boxShadow: '0 0 8px rgba(184,137,42,0.7)' }}
                />
              )}
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[10px] font-semibold leading-none">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
