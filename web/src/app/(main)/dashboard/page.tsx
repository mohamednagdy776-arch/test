'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { useSuggestions } from '@/features/friends/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { useUpcomingEvents } from '@/features/events/hooks';
import { useSuggestedGroups } from '@/features/groups/hooks';
import { useUnreadCount as useChatUnread } from '@/features/chat/hooks';
import { useUnreadCount as useNotifUnread } from '@/features/notifications/hooks';
import { apiClient } from '@/lib/api-client';
import { displayName } from '@/lib/utils';
import Image from 'next/image';
import {
  Baby, PencilSimple, MagnifyingGlass,
  ArrowClockwise, TrendUp, UsersThree, Heart, Sparkle,
  CheckCircle, WarningCircle, CalendarBlank, ChatCircle,
  Bell, HouseSimple,
} from '@phosphor-icons/react';

import { resolveMediaUrl } from '@/lib/media';

// ─── Greeting Banner ──────────────────────────────────────────────────────────
function GreetingBanner() {
  const router = useRouter();
  const { data: profileData } = useMyProfile();
  const user = (profileData as any)?.data;
  const name = (user?.fullName ?? user?.name)?.split(' ')[0] || user?.username || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';
  const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="relative overflow-hidden rounded-2xl mb-5 p-5"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)',
        boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 35%, transparent)',
      }}>
      <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{ background: 'white' }} />
      <div className="absolute -bottom-8 -right-4 w-36 h-36 rounded-full opacity-10" style={{ background: 'white' }} />
      <div className="absolute top-3 left-4 opacity-5 select-none pointer-events-none text-6xl font-black text-white">✦</div>

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-70 text-white">{today}</p>
          <p className="text-sm font-semibold opacity-90 text-white mt-0.5">
            {greeting}{name ? `، ${name}` : ''} 👋
          </p>
          <h2 className="text-lg font-extrabold text-white mt-0.5 leading-tight">
            أهلاً بك في مجتمع طيّبت
          </h2>
        </div>
        <button
          onClick={() => router.push('/posts')}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <PencilSimple size={15} weight="bold" />
          منشور جديد
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Widgets Strip (lg:hidden) ─────────────────────────────────────────
function MobileWidgetsStrip() {
  const router = useRouter();
  const { data: chatData } = useChatUnread();
  const { data: notifData } = useNotifUnread();
  const { data: matchesData } = useQuery({
    queryKey: ['dashboard-matches-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: friendsData } = useQuery({
    queryKey: ['dashboard-friends-count'],
    queryFn: () => apiClient.get('/friends', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const mc = matchesData?.meta?.total ?? matchesData?.data?.meta?.total ?? 0;
  const fc = friendsData?.meta?.total ?? friendsData?.data?.meta?.total ?? 0;
  const chatCount = chatData?.count ?? chatData?.unread ?? 0;
  const notifCount = notifData?.count ?? notifData?.unread ?? 0;

  const chips = [
    { icon: Heart, label: 'توافقات', value: mc, href: '/matching', color: '#e11d48' },
    { icon: UsersThree, label: 'أصدقاء', value: fc, href: '/friends', color: 'var(--primary)' },
    { icon: ChatCircle, label: 'رسائل', value: chatCount, href: '/chat', color: '#3b82f6' },
    { icon: Bell, label: 'إشعارات', value: notifCount, href: '/notifications', color: 'var(--accent)' },
    { icon: CalendarBlank, label: 'أحداث', value: null, href: '/events', color: 'var(--secondary)' },
    { icon: UsersThree, label: 'مجتمعات', value: null, href: '/groups', color: '#7c3aed' },
    { icon: HouseSimple, label: 'العائلة', value: null, href: '/family', color: '#d97706' },
  ];

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 mb-5 lg:hidden scrollbar-thin -mx-1 px-1">
      {chips.map(({ icon: Icon, label, value, href, color }) => (
        <button key={href} onClick={() => router.push(href)}
          aria-label={label}
          className="shrink-0 flex flex-col items-center gap-1.5 rounded-2xl px-3.5 py-3 transition-all hover:scale-105 active:scale-95 border min-w-[68px]"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: '0 1px 8px color-mix(in srgb, var(--foreground) 5%, transparent)',
          }}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${color} 12%, var(--muted))` }}>
              <Icon size={20} weight="fill" style={{ color }} />
            </div>
            {typeof value === 'number' && value > 0 && (
              <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-extrabold text-white"
                style={{ background: color === 'var(--accent)' ? '#B8892A' : color === 'var(--primary)' ? '#0A3D2B' : color }}>
                {value > 99 ? '99+' : value}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Profile Completeness ──────────────────────────────────────────────────────
function ProfileCompleteness() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['profile-completeness'],
    queryFn: () => apiClient.get('/users/me/completeness').then((r) => r.data),
    staleTime: 300_000,
  });

  const score = data?.data?.score ?? data?.score ?? data?.completeness ?? data?.percentage ?? 0;
  const missing: string[] = data?.missing ?? data?.incompleteSections ?? [];
  const pct = Math.min(100, Math.max(0, Number(score)));

  if (isLoading) {
    return (
      <div className="rounded-2xl p-4 animate-pulse card-theme-default border">
        <div className="h-4 rounded-lg w-36 mb-3" style={{ background: 'var(--muted)' }} />
        <div className="h-2 rounded-full w-full mb-2" style={{ background: 'var(--muted)' }} />
        <div className="h-3 rounded-lg w-24" style={{ background: 'var(--muted)' }} />
      </div>
    );
  }

  const barColor = pct >= 80 ? 'var(--primary)' : pct >= 50 ? 'var(--accent)' : '#ef4444';
  const isDone = pct === 100;

  return (
    <div className="rounded-2xl p-4 card-theme-default border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isDone
            ? <CheckCircle size={18} weight="fill" style={{ color: 'var(--primary)' }} />
            : <WarningCircle size={18} weight="fill" style={{ color: barColor }} />}
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>اكتمال الملف الشخصي</h3>
        </div>
        <span className="text-base font-extrabold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--muted)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, color-mix(in srgb, ${barColor} 70%, white))` }} />
      </div>
      {isDone ? (
        <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>ملفك الشخصي مكتمل! ✓</p>
      ) : missing.length > 0 ? (
        <div className="space-y-0.5">
          {missing.slice(0, 3).map((s) => (
            <p key={s} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {s}</p>
          ))}
          <button
            onClick={() => router.push('/profile')}
            className="mt-1.5 text-xs font-semibold transition-colors hover:opacity-80"
            style={{ color: 'var(--primary)' }}>
            أكمل الملف الآن ←
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push('/profile')}
          className="text-xs font-semibold transition-colors hover:opacity-80"
          style={{ color: 'var(--primary)' }}>
          تعديل الملف الشخصي →
        </button>
      )}
    </div>
  );
}

// ─── Quick Stats ───────────────────────────────────────────────────────────────
function QuickStats() {
  const router = useRouter();
  const { data: matchesData, isLoading: ml, refetch: rm, isFetching: fm } = useQuery({
    queryKey: ['dashboard-matches-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: friendsData, isLoading: fl, refetch: rf, isFetching: ff } = useQuery({
    queryKey: ['dashboard-friends-count'],
    queryFn: () => apiClient.get('/friends', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  // "رسائل" here means message/conversation ACTIVITY, not the unread badge —
  // it read the unread-count endpoint, which correctly drops to 0 the moment
  // conversations are opened, so anyone with plenty of read conversations
  // still saw 0 (#69). Count total conversations instead, matching the
  // total-count pattern already used for matches/friends above.
  const { data: chatData, isLoading: cl } = useQuery({
    queryKey: ['dashboard-messages-count'],
    queryFn: () => apiClient.get('/chat/conversations').then((r) => r.data),
    staleTime: 60_000,
  });

  const mc = matchesData?.meta?.total ?? matchesData?.data?.meta?.total ?? 0;
  const fc = friendsData?.meta?.total ?? friendsData?.data?.meta?.total ?? 0;
  const chatCount = chatData?.data?.length ?? 0;
  const isLoading = ml || fl || cl;
  const isFetching = fm || ff;

  const stats = [
    { label: 'توافقات', value: mc, icon: Heart, href: '/matching', color: 'rgba(255,255,255,0.9)' },
    { label: 'أصدقاء', value: fc, icon: UsersThree, href: '/friends', color: 'rgba(255,255,255,0.9)' },
    { label: 'رسائل', value: chatCount, icon: ChatCircle, href: '/chat', color: 'rgba(255,255,255,0.9)' },
  ];

  return (
    <div className="rounded-2xl p-4 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        boxShadow: '0 6px 24px color-mix(in srgb, var(--primary) 30%, transparent)',
      }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendUp size={18} weight="bold" className="text-white/80" />
          <p className="text-sm font-bold text-white">نشاطك</p>
        </div>
        <button onClick={() => { rm(); rf(); }} disabled={isFetching}
          className="p-1.5 rounded-lg text-white/70 hover:text-white transition-all disabled:opacity-50"
          aria-label="تحديث">
          <ArrowClockwise size={14} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center">
              <div className="h-7 rounded-lg bg-[var(--card)]/20 animate-pulse mb-1" />
              <div className="h-2 rounded bg-[var(--card)]/10 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <button key={label} onClick={() => router.push(href)}
              className="flex flex-col items-center p-2.5 rounded-xl transition-all hover:bg-[var(--card)]/10 active:scale-95">
              <Icon size={16} weight="fill" className="text-white/60 mb-1" />
              <span className="text-2xl font-extrabold text-white leading-none tabular-nums">
                {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
              </span>
              <span className="text-[10px] text-white/60 mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-[var(--card)]/5" />
    </div>
  );
}

// ─── Upcoming Events ───────────────────────────────────────────────────────────
function UpcomingEventsWidget() {
  const router = useRouter();
  const { data, isLoading } = useUpcomingEvents(3);
  const events: any[] = data?.data ?? data?.events ?? [];

  return (
    <div className="rounded-2xl overflow-hidden card-theme-default border">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarBlank size={18} weight="fill" style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>أحداث قادمة</h3>
        </div>
        <button onClick={() => router.push('/events')}
          className="text-xs font-semibold transition-colors hover:opacity-70"
          style={{ color: 'var(--primary)' }}>
          عرض الكل
        </button>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse">
              <div className="h-10 w-10 rounded-xl shrink-0" style={{ background: 'var(--muted)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded-lg w-28" style={{ background: 'var(--muted)' }} />
                <div className="h-2.5 rounded-lg w-16" style={{ background: 'var(--muted)' }} />
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="text-center py-5 px-2">
            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>لا توجد أحداث قادمة</p>
            <button onClick={() => router.push('/events')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
              استكشف الأحداث
            </button>
          </div>
        ) : (
          events.map((event: any) => {
            const date = event.startDate ? new Date(event.startDate) : null;
            const dayNum = date?.getDate();
            const monthName = date?.toLocaleDateString('ar-SA', { month: 'short' });
            return (
              <button key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="w-full flex items-center gap-3 rounded-xl p-2.5 text-right transition-all group hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]">
                <div className="shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--muted))' }}>
                  <span className="text-sm font-extrabold leading-none" style={{ color: 'var(--accent)' }}>{dayNum}</span>
                  <span className="text-[9px] font-medium leading-none mt-0.5" style={{ color: 'var(--accent)' }}>{monthName}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-[var(--primary)] transition-colors"
                    style={{ color: 'var(--foreground)' }}>{event.title || 'حدث'}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                    {event.location || event.type || 'حدث مجتمعي'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Suggested Connections ─────────────────────────────────────────────────────
function SuggestedConnections() {
  const router = useRouter();
  const { data, isLoading } = useSuggestions(4);
  const suggestions: any[] = data?.data ?? [];

  return (
    <div className="rounded-2xl overflow-hidden card-theme-default border">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>أشخاص قد تعرفهم</h3>
        <button onClick={() => router.push('/friends')}
          className="text-xs font-semibold transition-colors hover:opacity-70"
          style={{ color: 'var(--primary)' }}>
          عرض الكل
        </button>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse">
              <div className="h-10 w-10 rounded-xl shrink-0" style={{ background: 'var(--muted)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded-lg w-24" style={{ background: 'var(--muted)' }} />
                <div className="h-2.5 rounded-lg w-16" style={{ background: 'var(--muted)' }} />
              </div>
              <div className="h-7 w-16 rounded-lg" style={{ background: 'var(--muted)' }} />
            </div>
          ))
        ) : suggestions.length === 0 ? (
          <p className="text-center text-xs py-5" style={{ color: 'var(--muted-foreground)' }}>
            لا توجد اقتراحات حالياً
          </p>
        ) : (
          suggestions.map((s: any) => {
            const u = s.userId ?? s;
            const nm = displayName(s);
            const city = u?.profile?.city || '';
            const age = u?.profile?.age;
            const initial = nm.charAt(0).toUpperCase();
            const mutual = s.mutual ?? 0;
            // Same field-name mismatch as the Friends page (#262): the
            // suggestions API nests the avatar under `.profile.avatarUrl`,
            // never a flat `.avatar`.
            const avatarUrl = resolveMediaUrl(u?.avatar ?? u?.profile?.avatarUrl);
            return (
              <button key={u?.id ?? nm}
                onClick={() => u?.username && router.push(`/${u.username}`)}
                className="w-full flex items-center gap-3 rounded-xl p-2.5 text-right transition-all hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] group">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={nm} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
                      {initial}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-[var(--primary)] transition-colors"
                    style={{ color: 'var(--foreground)' }}>{nm}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    {age ? `${age} سنة` : ''}{age && city ? ' · ' : ''}{city}
                    {mutual > 0 ? ` · ${mutual} مشترك` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                  إضافة
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Suggested Groups ──────────────────────────────────────────────────────────
function SuggestedGroupsWidget() {
  const router = useRouter();
  const { data, isLoading } = useSuggestedGroups(3);
  const groups: any[] = data?.data ?? data?.groups ?? [];

  return (
    <div className="rounded-2xl overflow-hidden card-theme-default border">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersThree size={18} weight="fill" style={{ color: 'var(--secondary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>مجتمعات مقترحة</h3>
        </div>
        <button onClick={() => router.push('/groups')}
          className="text-xs font-semibold transition-colors hover:opacity-70"
          style={{ color: 'var(--primary)' }}>
          عرض الكل
        </button>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse">
              <div className="h-9 w-9 rounded-xl shrink-0" style={{ background: 'var(--muted)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded-lg w-24" style={{ background: 'var(--muted)' }} />
                <div className="h-2.5 rounded-lg w-16" style={{ background: 'var(--muted)' }} />
              </div>
              <div className="h-7 w-14 rounded-lg" style={{ background: 'var(--muted)' }} />
            </div>
          ))
        ) : groups.length === 0 ? (
          <p className="text-center text-xs py-5" style={{ color: 'var(--muted-foreground)' }}>لا توجد اقتراحات</p>
        ) : (
          groups.map((group: any) => {
            const name = group.name || 'مجتمع';
            const count = group.memberCount ?? group.membersCount ?? 0;
            const initial = name.charAt(0);
            return (
              <div key={group.id} className="flex items-center gap-3 rounded-xl p-2.5">
                <div className="shrink-0 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold">
                  {group.coverPhoto ? (
                    <Image src={resolveMediaUrl(group.coverPhoto) ?? ''}
                      alt={name} width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}>
                      {initial}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    {count > 0 ? `${count.toLocaleString('ar-SA')} عضو` : 'مجتمع جديد'}
                  </p>
                </div>
                <button onClick={() => router.push(`/groups/${group.id}`)}
                  aria-label={`انضم إلى ${name}`}
                  className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                  انضم
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Child Prediction Promo ────────────────────────────────────────────────────
function ChildPredictionWidget() {
  const router = useRouter();
  return (
    <div className="rounded-2xl p-4 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        boxShadow: '0 6px 24px rgba(124,58,237,0.3)',
      }}>
      <div className="flex items-start gap-3 relative z-10">
        <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--card)]/20">
          <Baby size={24} weight="fill" className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">توقع شكل طفلك</p>
          <p className="text-[11px] mt-0.5 leading-relaxed text-white/75">
            تقنية الذكاء الاصطناعي تتوقع ملامح طفلك من صورتَيكما
          </p>
        </div>
      </div>
      <button onClick={() => router.push('/child-prediction')}
        className="mt-3 w-full rounded-xl px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 relative z-10"
        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
        جرّب الآن ←
      </button>
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[var(--card)]/5" />
    </div>
  );
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────
function QuickActions() {
  const router = useRouter();
  const actions = [
    { icon: MagnifyingGlass, label: 'ابحث عن أشخاص', href: '/search', color: 'var(--primary)' },
    { icon: CalendarBlank, label: 'الأحداث', href: '/events', color: 'var(--accent)' },
    { icon: UsersThree, label: 'المجتمعات', href: '/groups', color: 'var(--secondary)' },
    { icon: HouseSimple, label: 'شجرة العائلة', href: '/family', color: '#d97706' },
    { icon: Sparkle, label: 'ترقية الحساب', href: '/upgrade', color: '#ec4899' },
  ];
  return (
    <div className="rounded-2xl p-3 card-theme-default border">
      <h3 className="text-xs font-bold px-1 mb-2" style={{ color: 'var(--muted-foreground)' }}>روابط سريعة</h3>
      <div className="space-y-0.5">
        {actions.map(({ icon: Icon, label, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-all group hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]">
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${color} 12%, var(--muted))` }}>
              <Icon size={16} weight="fill" style={{ color }} />
            </div>
            <span className="text-sm font-semibold flex-1 text-right group-hover:text-[var(--primary)] transition-colors"
              style={{ color: 'var(--foreground)' }}>{label}</span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--primary)' }}>←</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Trending Topics ───────────────────────────────────────────────────────────
function TrendingTopics() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['trending-posts'],
    // Use the user-facing ranked feed. Root GET /posts is the admin-only listing
    // (RolesGuard) and 403s for normal users, spamming a retry loop (#815).
    queryFn: () => apiClient.get('/feed/scored', { params: { limit: 5 } }).then((r) => r.data),
    staleTime: 120_000,
  });
  const posts: any[] = data?.data ?? data?.posts ?? [];

  return (
    <div className="rounded-2xl overflow-hidden card-theme-default border">
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <TrendUp size={18} weight="fill" style={{ color: 'var(--primary)' }} />
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>المنشورات الرائجة</h3>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse">
              <div className="h-8 w-8 rounded-lg shrink-0" style={{ background: 'var(--muted)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded-lg w-32" style={{ background: 'var(--muted)' }} />
                <div className="h-2.5 rounded-lg w-20" style={{ background: 'var(--muted)' }} />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <p className="text-center text-xs py-5" style={{ color: 'var(--muted-foreground)' }}>لا توجد منشورات رائجة</p>
        ) : (
          posts.map((post: any, i: number) => {
            const title = (post.content ?? post.title ?? '').slice(0, 50) || 'منشور';
            const reactions = (post.likesCount ?? 0) + (post.commentsCount ?? 0);
            return (
              <button key={post.id ?? i}
                onClick={() => post.id && router.push(`/posts/${post.id}`)}
                className="w-full text-right rounded-xl p-2.5 transition-all group hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                    style={{ background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))', color: 'var(--primary)' }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-[var(--primary)] transition-colors"
                      style={{ color: 'var(--foreground)' }}>{title}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{reactions.toLocaleString('ar-SA')} تفاعل</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="flex gap-5 lg:gap-6">

      {/* Main feed column */}
      <div className="flex-1 min-w-0">
        <GreetingBanner />
        <MobileWidgetsStrip />
        <PostFeed />
      </div>

      {/* Right sidebar — visible on large screens */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
        <div className="sticky top-[4.5rem] space-y-4 overflow-y-auto scrollbar-thin"
          style={{ maxHeight: 'calc(100vh - 5.5rem)' }}>
          <ProfileCompleteness />
          <QuickStats />
          <UpcomingEventsWidget />
          <SuggestedConnections />
          <SuggestedGroupsWidget />
          <ChildPredictionWidget />
          <QuickActions />
          <TrendingTopics />
        </div>
      </aside>

    </div>
  );
}
