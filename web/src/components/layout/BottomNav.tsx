'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  House, Heart, ChatCircle, MagnifyingGlass, User, DotsThreeOutline,
  Bell, BookmarkSimple, HeartStraight, UsersThree, ShieldCheck,
  CalendarBlank, UsersFour, Flag, Clock, PlayCircle, FilmStrip,
  Baby, TestTube, ShareNetwork, Gear,
} from '@phosphor-icons/react';
import { useT } from '@/i18n/I18nProvider';
import { useUnreadCount as useChatUnread } from '@/features/chat/hooks';
import { Modal } from '@/components/ui/Modal';

const tabs = [
  { href: '/dashboard',  labelKey: 'nav.home',         icon: House },
  { href: '/matching',   labelKey: 'nav.matching',     icon: Heart },
  { href: '/chat',       labelKey: 'nav.messages',     icon: ChatCircle },
  { href: '/search',     labelKey: 'nav.search',       icon: MagnifyingGlass },
  { href: '/profile',    labelKey: 'nav.profileShort', icon: User },
];

// Everything Sidebar.tsx exposes that doesn't have its own bottom-nav tab --
// on mobile/tablet (<lg) these were completely unreachable, most notably
// Interests and Pages, since Sidebar itself is `hidden lg:block` (#431).
// Kept in the same order/grouping as Sidebar's navGroups for consistency.
const moreItems = [
  { href: '/notifications',    labelKey: 'nav.notifications',    icon: Bell },
  { href: '/saved',            labelKey: 'nav.saved',            icon: BookmarkSimple },
  { href: '/interests',        labelKey: 'nav.interests',        icon: HeartStraight },
  { href: '/friends',          labelKey: 'nav.friends',          icon: UsersThree },
  { href: '/family',           labelKey: 'nav.family',           icon: ShieldCheck },
  { href: '/events',           labelKey: 'nav.events',           icon: CalendarBlank },
  { href: '/groups',           labelKey: 'nav.communities',      icon: UsersFour },
  { href: '/pages',            labelKey: 'nav.pages',            icon: Flag },
  { href: '/memories',         labelKey: 'nav.memories',         icon: Clock },
  { href: '/watch',            labelKey: 'nav.watch',            icon: PlayCircle },
  { href: '/reels',            labelKey: 'nav.reels',            icon: FilmStrip },
  { href: '/child-prediction', labelKey: 'nav.childPrediction',  icon: Baby },
  { href: '/lab-portal',       labelKey: 'nav.labPortal',        icon: TestTube },
  { href: '/affiliates',       labelKey: 'nav.affiliates',       icon: ShareNetwork },
  { href: '/settings',         labelKey: 'nav.settings',         icon: Gear },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useT();
  const [showMore, setShowMore] = useState(false);
  // Mobile Chat tab had no unread indicator either (#307/#308).
  const { data: chatUnreadData } = useChatUnread();
  const chatUnreadCount = chatUnreadData?.count ?? 0;
  const isMoreActive = moreItems.some(({ href }) =>
    pathname === href || pathname.startsWith(href + '/'));

  return (
    <>
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
                <span className="relative">
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  {href === '/chat' && chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 h-[15px] min-w-[15px] px-1 rounded-full bg-[var(--destructive)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold leading-none">{t(labelKey)}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-200 min-h-[56px]"
            style={{ color: isMoreActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg)' }}
          >
            {isMoreActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full"
                style={{ background: '#B8892A', boxShadow: '0 0 8px rgba(184,137,42,0.7)' }}
              />
            )}
            <DotsThreeOutline size={22} weight={isMoreActive ? 'fill' : 'regular'} />
            <span className="text-[10px] font-semibold leading-none">{t('nav.more')}</span>
          </button>
        </div>
      </nav>

      <Modal open={showMore} onClose={() => setShowMore(false)} title={t('nav.more')} size="sm">
        <div className="grid grid-cols-3 gap-2">
          {moreItems.map(({ href, labelKey, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMore(false)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors"
                style={{
                  background: isActive ? 'var(--sidebar-active-bg)' : 'var(--muted)',
                  color: isActive ? 'var(--sidebar-active-fg)' : 'var(--foreground)',
                }}
              >
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-xs font-medium leading-tight">{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
