'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { useSuggestions } from '@/features/friends/hooks';
import { apiClient } from '@/lib/api-client';
import { displayName } from '@/lib/utils';
import { Baby, PencilSimple, MagnifyingGlass, HeartHalf } from '@phosphor-icons/react';

function ProfileCompleteness() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-completeness'],
    queryFn: () => apiClient.get('/users/me/completeness').then((r) => r.data),
    staleTime: 300_000,
  });

  const score = data?.score ?? data?.completeness ?? data?.percentage ?? 0;
  const missing: string[] = data?.missing ?? data?.incompleteSections ?? [];

  if (isLoading) {
    return (
      <div className="rounded-3xl shadow-soft p-4 animate-pulse" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="h-4 rounded w-36 mb-3" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-2.5 rounded-full w-full mb-2" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-3 rounded w-24" style={{ backgroundColor: 'var(--muted)' }} />
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, Number(score)));
  const barColor = pct >= 80 ? 'var(--primary)' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="rounded-3xl shadow-soft p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold" style={{ color: 'var(--primary)' }}>اكتمال الملف الشخصي</h3>
        <span className="text-lg font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
      {pct < 100 && missing.length > 0 && (
        <div>
          <p className="text-[11px] mb-1" style={{ color: 'var(--muted-foreground)' }}>أكمل هذه الأقسام:</p>
          {missing.slice(0, 3).map((section) => (
            <p key={section} className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>• {section}</p>
          ))}
        </div>
      )}
      {pct === 100 && (
        <p className="text-[11px]" style={{ color: 'var(--primary)' }}>✓ ملفك الشخصي مكتمل!</p>
      )}
    </div>
  );
}

function ChildPredictionWidget() {
  const router = useRouter();
  return (
    <div
      className="rounded-3xl p-4 overflow-hidden relative"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
          <Baby size={22} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>توقع شكل طفلك</p>
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            تقنية الذكاء الاصطناعي تتوقع ملامح طفلك من صورتَيكما
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push('/child-prediction')}
        className="mt-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        جرّب الآن
      </button>
    </div>
  );
}

function SuggestedConnections() {
  const router = useRouter();
  const { data, isLoading } = useSuggestions(4);
  const suggestions: any[] = data?.data ?? [];

  return (
    <div className="rounded-3xl shadow-soft overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--primary)' }}>أشخاص قد تعرفهم</h3>
      </div>
      <div className="p-3 space-y-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5 animate-pulse">
              <div className="h-10 w-10 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded w-24" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-2.5 rounded w-16" style={{ backgroundColor: 'var(--muted)' }} />
              </div>
            </div>
          ))
        ) : suggestions.length === 0 ? (
          <p className="text-center text-xs py-4" style={{ color: 'var(--muted-foreground)' }}>لا توجد اقتراحات حالياً</p>
        ) : (
          suggestions.map((s: any) => {
            const user = s.userId ?? s;
            const name = displayName(s);
            const city = user?.profile?.city || '';
            const age = user?.profile?.age;
            const initial = name.charAt(0).toUpperCase();
            const mutual = s.mutual ?? 0;
            return (
              <button
                key={user?.id ?? name}
                onClick={() => user?.username && router.push(`/${user.username}`)}
                className="w-full flex items-center gap-3 rounded-2xl p-2.5 transition-colors group text-right hover:-translate-y-0.5"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                aria-label={`عرض ملف ${name}`}
              >
                <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-base font-bold shadow-soft" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    {age ? `${age} سنة` : ''}{age && city ? ' · ' : ''}{city}
                    {mutual > 0 ? ` · ${mutual} مشترك` : ''}
                  </p>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--primary)' }} aria-hidden="true">←</span>
              </button>
            );
          })
        )}
      </div>
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => router.push('/friends')}
          className="w-full rounded-2xl py-2 text-xs font-semibold transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--muted)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
        >
          عرض المزيد
        </button>
      </div>
    </div>
  );
}

function TrendingTopics() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: () =>
      apiClient.get('/posts', { params: { page: 1, limit: 4, sortBy: 'feedScore', order: 'DESC' } }).then((r) => r.data),
    staleTime: 120_000,
  });

  const posts: any[] = data?.data ?? data?.posts ?? [];

  return (
    <div className="rounded-3xl shadow-soft overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--primary)' }}>🔥 المنشورات الرائجة</h3>
      </div>
      <div className="p-3 space-y-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5 animate-pulse">
              <div className="h-10 w-10 rounded-2xl" style={{ backgroundColor: 'var(--muted)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded w-32" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-2.5 rounded w-20" style={{ backgroundColor: 'var(--muted)' }} />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <p className="text-center text-xs py-4" style={{ color: 'var(--muted-foreground)' }}>لا توجد منشورات رائجة حالياً</p>
        ) : (
          posts.map((post: any, i: number) => {
            const title = (post.content ?? post.title ?? '').slice(0, 40) || 'منشور';
            const reactions = (post.likesCount ?? 0) + (post.commentsCount ?? 0);
            const EMOJIS = ['🔥', '💡', '⭐', '💬'];
            return (
              <button
                key={post.id ?? i}
                className="w-full text-right rounded-2xl p-2.5 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                onClick={() => post.id && router.push(`/posts/${post.id}`)}
                aria-label={`منشور رائج: ${title}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: 'var(--muted)' }}>
                    {EMOJIS[i % EMOJIS.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{title}</p>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>#{i + 1}</span>
                    </div>
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

const QUICK_ACTIONS = [
  { Icon: PencilSimple,    label: 'إنشاء منشور',    href: '/posts' },
  { Icon: MagnifyingGlass, label: 'ابحث عن أشخاص', href: '/search' },
  { Icon: HeartHalf,       label: 'التوافقات',       href: '/matching' },
  { Icon: Baby,            label: 'توقع شكل طفلك',  href: '/child-prediction' },
] as const;

function QuickActions() {
  const router = useRouter();
  return (
    <div className="rounded-3xl shadow-soft p-3 space-y-1" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      {QUICK_ACTIONS.map(({ Icon, label, href }) => (
        <button
          key={href}
          onClick={() => router.push(href)}
          className="w-full flex items-center gap-3 rounded-2xl p-2.5 transition-all text-right hover:-translate-y-0.5"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
        >
          <Icon size={18} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

function QuickStats() {
  const { data: matchesData, isLoading: ml, isError: me, refetch: rm, isFetching: fm } = useQuery({
    queryKey: ['dashboard-matches-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: acceptedData, isLoading: al, isFetching: af } = useQuery({
    queryKey: ['dashboard-accepted-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 1, status: 'accepted' } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: friendsData, isLoading: fl, isError: fe, refetch: rf, isFetching: ff } = useQuery({
    queryKey: ['dashboard-friends-count'],
    queryFn: () => apiClient.get('/friends', { params: { page: 1, limit: 1 } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const matchesCount = matchesData?.meta?.total ?? matchesData?.data?.meta?.total ?? 0;
  const acceptedCount = acceptedData?.meta?.total ?? acceptedData?.data?.meta?.total ?? 0;
  const friendsCount = friendsData?.meta?.total ?? friendsData?.data?.meta?.total ?? 0;
  const isLoading = ml || fl || al;
  const isError = me || fe;
  const isEmpty = !isLoading && !isError && matchesCount === 0 && friendsCount === 0;

  return (
    <div
      className="rounded-3xl p-5 text-white shadow-lg"
      style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #94B4C1))' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold opacity-90">نشاطك</p>
        <button
          onClick={() => { rm(); rf(); }}
          disabled={fm || ff || af}
          title="تحديث"
          className="text-xs opacity-80 hover:opacity-100 disabled:opacity-50 transition-opacity"
        >
          {fm || ff ? '⏳' : '↻'}
        </button>
      </div>
      {isError ? (
        <p className="text-xs opacity-90 py-2">تعذّر تحميل الإحصائيات. حدّث الصفحة للمحاولة مرة أخرى.</p>
      ) : isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center">
              <div className="h-7 w-8 mx-auto rounded bg-white/30 animate-pulse" />
              <div className="h-2 w-10 mx-auto mt-1 rounded bg-white/20 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{matchesCount}</p>
              <p className="text-[10px] opacity-70">توافقات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-[10px] opacity-70">مقبولة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{friendsCount}</p>
              <p className="text-[10px] opacity-70">أصدقاء</p>
            </div>
          </div>
          {isEmpty && (
            <p className="text-[11px] opacity-90 mt-3 leading-relaxed">
              ابدأ رحلتك: أكمل ملفك الشخصي وأضف أصدقاء لرؤية نشاطك هنا.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>الرئيسية</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>آخر المنشورات من مجتمعاتك</p>
        </div>
        <PostFeed />
      </div>

      <aside className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-[5.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin space-y-5 pr-1">
          <ProfileCompleteness />
          <QuickStats />
          <QuickActions />
          <ChildPredictionWidget />
          <SuggestedConnections />
          <TrendingTopics />
        </div>
      </aside>
    </div>
  );
}
