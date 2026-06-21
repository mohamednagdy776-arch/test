'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { useSuggestions } from '@/features/friends/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { apiClient } from '@/lib/api-client';
import { displayName } from '@/lib/utils';
import Image from 'next/image';
import {
  Baby, PencilSimple, MagnifyingGlass, HeartHalf,
  ArrowClockwise, TrendUp, UsersThree, Heart, Sparkle,
  CheckCircle, WarningCircle,
} from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

function GreetingBanner() {
  const { data: profileData } = useMyProfile();
  const user = (profileData as any)?.data;
  const name = user?.name?.split(' ')[0] || user?.username || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-5 p-5"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)',
        boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 35%, transparent)',
      }}>
      {/* decorative circles */}
      <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{ background: 'white' }} />
      <div className="absolute -bottom-8 -right-4 w-36 h-36 rounded-full opacity-10" style={{ background: 'white' }} />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 text-white">{greeting}{name ? '،' : ''}</p>
          {name && <h2 className="text-xl font-extrabold text-white mt-0.5">{name} 👋</h2>}
          <p className="text-xs opacity-70 text-white mt-1">ابدأ يومك بمنشور جديد</p>
        </div>
        <button
          onClick={() => document.getElementById('post-composer-trigger')?.click()}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <PencilSimple size={16} weight="bold" />
          اكتب
        </button>
      </div>
    </div>
  );
}

function ProfileCompleteness() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-completeness'],
    queryFn: () => apiClient.get('/users/me/completeness').then((r) => r.data),
    staleTime: 300_000,
  });

  const score = data?.score ?? data?.completeness ?? data?.percentage ?? 0;
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
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>اكتمال الملف</h3>
        </div>
        <span className="text-base font-extrabold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--muted)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, color-mix(in srgb, ${barColor} 70%, white))` }} />
      </div>
      {isDone ? (
        <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>ملفك الشخصي مكتمل! ✓</p>
      ) : missing.length > 0 && (
        <div className="space-y-0.5">
          {missing.slice(0, 3).map((s) => (
            <p key={s} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {s}</p>
          ))}
          <button
            onClick={() => window.location.href = '/settings'}
            className="mt-1.5 text-xs font-semibold transition-colors"
            style={{ color: 'var(--primary)' }}>
            أكمل الآن ←
          </button>
        </div>
      )}
    </div>
  );
}

function QuickStats() {
  const { data: matchesData, isLoading: ml, refetch: rm, isFetching: fm } = useQuery({
    queryKey: ['dashboard-matches-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: acceptedData, isLoading: al, isFetching: af } = useQuery({
    queryKey: ['dashboard-accepted-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 1, status: 'accepted' } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: friendsData, isLoading: fl, refetch: rf, isFetching: ff } = useQuery({
    queryKey: ['dashboard-friends-count'],
    queryFn: () => apiClient.get('/friends', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const mc = matchesData?.meta?.total ?? matchesData?.data?.meta?.total ?? 0;
  const ac = acceptedData?.meta?.total ?? acceptedData?.data?.meta?.total ?? 0;
  const fc = friendsData?.meta?.total ?? friendsData?.data?.meta?.total ?? 0;
  const isLoading = ml || fl || al;
  const isFetching = fm || ff || af;

  const stats = [
    { label: 'توافقات', value: mc, icon: Heart, href: '/matching' },
    { label: 'مقبولة', value: ac, icon: HeartHalf, href: '/matching' },
    { label: 'أصدقاء', value: fc, icon: UsersThree, href: '/friends' },
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
              <div className="h-7 rounded-lg bg-white/20 animate-pulse mb-1" />
              <div className="h-2 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <button key={label} onClick={() => window.location.href = href}
              className="flex flex-col items-center p-2.5 rounded-xl transition-all hover:bg-white/10 active:scale-95">
              <Icon size={16} weight="fill" className="text-white/60 mb-1" />
              <span className="text-2xl font-extrabold text-white leading-none">{value}</span>
              <span className="text-[10px] text-white/60 mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      )}
      {/* decorative */}
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
    </div>
  );
}

function SuggestedConnections() {
  const router = useRouter();
  const { data, isLoading } = useSuggestions(4);
  const suggestions: any[] = data?.data ?? [];

  return (
    <div className="rounded-2xl overflow-hidden card-theme-default border">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>أشخاص قد تعرفهم</h3>
        <button onClick={() => router.push('/friends')} className="text-xs font-semibold transition-colors"
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
            const avatarUrl = u?.avatar ? `${API_BASE}${u.avatar}` : null;
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

function TrendingTopics() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: () => apiClient.get('/posts', { params: { page: 1, limit: 5, sortBy: 'feedScore', order: 'DESC' } }).then((r) => r.data),
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
                    style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-[var(--primary)] transition-colors"
                      style={{ color: 'var(--foreground)' }}>{title}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{reactions} تفاعل</p>
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

function ChildPredictionWidget() {
  const router = useRouter();
  return (
    <div className="rounded-2xl p-4 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        boxShadow: '0 6px 24px rgba(139,92,246,0.3)',
      }}>
      <div className="flex items-start gap-3 relative z-10">
        <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-white/20">
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
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
    </div>
  );
}

function QuickActions() {
  const router = useRouter();
  const actions = [
    { icon: MagnifyingGlass, label: 'ابحث عن أشخاص', href: '/search', color: 'var(--accent)' },
    { icon: HeartHalf, label: 'التوافقات', href: '/matching', color: '#ec4899' },
    { icon: Baby, label: 'توقع شكل طفلك', href: '/child-prediction', color: '#8b5cf6' },
    { icon: Sparkle, label: 'ترقية الحساب', href: '/upgrade', color: 'var(--accent)' },
  ];
  return (
    <div className="rounded-2xl p-3 card-theme-default border">
      <h3 className="text-xs font-bold px-1 mb-2" style={{ color: 'var(--muted-foreground)' }}>روابط سريعة</h3>
      <div className="space-y-0.5">
        {actions.map(({ icon: Icon, label, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-all group hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]">
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
              <Icon size={16} weight="fill" style={{ color }} />
            </div>
            <span className="text-sm font-semibold group-hover:text-[var(--primary)] transition-colors"
              style={{ color: 'var(--foreground)' }}>{label}</span>
            <span className="mr-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--primary)' }}>←</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">
        <GreetingBanner />
        <PostFeed />
      </div>

      <aside className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-[4.5rem] space-y-4 overflow-y-auto scrollbar-thin"
          style={{ maxHeight: 'calc(100vh - 5.5rem)' }}>
          <ProfileCompleteness />
          <QuickStats />
          <SuggestedConnections />
          <ChildPredictionWidget />
          <QuickActions />
          <TrendingTopics />
        </div>
      </aside>
    </div>
  );
}
