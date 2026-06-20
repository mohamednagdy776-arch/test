'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { useSuggestions } from '@/features/friends/hooks';
import { apiClient } from '@/lib/api-client';
import { cn, displayName } from '@/lib/utils';

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
      <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 p-4 animate-pulse">
        <div className="h-4 bg-[#DCFCE7] rounded w-36 mb-3" />
        <div className="h-2.5 bg-[#DCFCE7] rounded-full w-full mb-2" />
        <div className="h-3 bg-[#DCFCE7] rounded w-24" />
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, Number(score)));
  const barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-[#059669]">اكتمال الملف الشخصي</h3>
        <span className="text-lg font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#DCFCE7] overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {pct < 100 && missing.length > 0 && (
        <div>
          <p className="text-[11px] text-[#A7F3D0] mb-1">أكمل هذه الأقسام:</p>
          {missing.slice(0, 3).map((section) => (
            <p key={section} className="text-[11px] text-[#10B981]">• {section}</p>
          ))}
        </div>
      )}
      {pct === 100 && (
        <p className="text-[11px] text-[#10B981]">✓ ملفك الشخصي مكتمل!</p>
      )}
    </div>
  );
}

function SuggestedConnections() {
  const router = useRouter();
  const { data, isLoading } = useSuggestions(4);
  const suggestions: any[] = data?.data ?? [];

  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DCFCE7]/40">
        <h3 className="text-sm font-bold text-[#059669]">أشخاص قد تعرفهم</h3>
      </div>
      <div className="p-3 space-y-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-[#DCFCE7]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[#DCFCE7] rounded w-24" />
                <div className="h-2.5 bg-[#DCFCE7] rounded w-16" />
              </div>
            </div>
          ))
        ) : suggestions.length === 0 ? (
          <p className="text-center text-xs text-[#10B981] py-4">لا توجد اقتراحات حالياً</p>
        ) : (
          suggestions.map((s: any) => {
            const user = s.userId ?? s;
            const name = displayName(s);
            const city = user?.profile?.city || '';
            const age = user?.profile?.age;
            const initial = name.charAt(0).toUpperCase();
            const mutual = s.mutual ?? 0;
            return (
              <div
                key={user?.id ?? name}
                onClick={() => user?.username && router.push(`/${user.username}`)}
                className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-[#DCFCE7]/50 transition-colors group cursor-pointer"
              >
                <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-base font-bold text-white shadow-soft bg-gradient-to-br from-emerald-400 to-emerald-600">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#065F46] truncate">{name}</p>
                  <p className="text-[11px] text-[#10B981]">
                    {age ? `${age} سنة` : ''}{age && city ? ' · ' : ''}{city}
                    {mutual > 0 ? ` · ${mutual} مشترك` : ''}
                  </p>
                </div>
                <button className="text-[10px] font-semibold text-[#10B981] hover:text-[#059669] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                  عرض
                </button>
              </div>
            );
          })
        )}
      </div>
      <div className="px-4 py-3 border-t border-[#DCFCE7]/40">
        <button
          onClick={() => router.push('/friends')}
          className="w-full rounded-2xl border border-[#DCFCE7] py-2 text-xs font-semibold text-[#10B981] hover:bg-[#DCFCE7]/50 hover:text-[#059669] transition-colors"
        >
          عرض المزيد
        </button>
      </div>
    </div>
  );
}

const TRENDING_COLORS = [
  'from-green-100 to-emerald-200',
  'from-amber-100 to-yellow-200',
  'from-pink-100 to-rose-200',
  'from-purple-100 to-violet-200',
];
const TRENDING_EMOJIS = ['🔥', '💡', '⭐', '💬'];

function TrendingTopics() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: () =>
      apiClient.get('/posts', { params: { page: 1, limit: 4, sortBy: 'feedScore', order: 'DESC' } }).then((r) => r.data),
    staleTime: 120_000,
  });

  const posts: any[] = data?.data ?? data?.posts ?? [];

  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DCFCE7]/40">
        <h3 className="text-sm font-bold text-[#059669]">🔥 المنشورات الرائجة</h3>
      </div>
      <div className="p-3 space-y-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5 animate-pulse">
              <div className="h-10 w-10 rounded-2xl bg-[#DCFCE7]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[#DCFCE7] rounded w-32" />
                <div className="h-2.5 bg-[#DCFCE7] rounded w-20" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <p className="text-center text-xs text-[#10B981] py-4">لا توجد منشورات رائجة حالياً</p>
        ) : (
          posts.map((post: any, i: number) => {
            const title = (post.content ?? post.title ?? '').slice(0, 40) || 'منشور';
            const reactions = (post.likesCount ?? 0) + (post.commentsCount ?? 0);
            return (
              <div key={post.id ?? i} className="w-full text-right rounded-2xl p-2.5 hover:bg-[#DCFCE7]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-inner bg-gradient-to-br', TRENDING_COLORS[i % TRENDING_COLORS.length])}>
                    {TRENDING_EMOJIS[i % TRENDING_EMOJIS.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#10B981] truncate">{title}</p>
                      <span className="text-[10px] text-[#6EE7B7] font-medium">#{i + 1}</span>
                    </div>
                    <p className="text-[11px] text-[#A7F3D0]">{reactions} تفاعل</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Quick-action shortcuts so new users have an obvious next step (#443).
function QuickActions() {
  const router = useRouter();
  const actions: [string, string, string][] = [
    ['✍️', 'إنشاء منشور', '/posts'],
    ['🧭', 'ابحث عن أشخاص', '/search'],
    ['💞', 'التوافقات', '/matching'],
  ];
  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 p-3 space-y-1">
      {actions.map(([icon, label, href]) => (
        <button
          key={href}
          onClick={() => router.push(href)}
          className="w-full flex items-center gap-3 rounded-2xl p-2.5 hover:bg-[#DCFCE7]/50 transition-colors text-right"
        >
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-semibold text-[#065F46]">{label}</span>
        </button>
      ))}
    </div>
  );
}

function QuickStats() {
  // Real counts — no fabricated activity (L-05).
  const { data: matchesData, isLoading: ml, isError: me, refetch: rm, isFetching: fm } = useQuery({
    queryKey: ['dashboard-matches-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: friendsData, isLoading: fl, isError: fe, refetch: rf, isFetching: ff } = useQuery({
    queryKey: ['dashboard-friends-count'],
    queryFn: () => apiClient.get('/friends', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const matchesArr = matchesData?.data?.data ?? matchesData?.data ?? [];
  const friendsArr = friendsData?.data?.data ?? friendsData?.data ?? [];
  const matchesCount = Array.isArray(matchesArr) ? matchesArr.length : 0;
  const friendsCount = Array.isArray(friendsArr) ? friendsArr.length : 0;
  const acceptedCount = Array.isArray(matchesArr)
    ? matchesArr.filter((m: any) => m.status === 'accepted').length
    : 0;
  const isLoading = ml || fl;
  const isError = me || fe;
  const isEmpty = !isLoading && !isError && matchesCount === 0 && friendsCount === 0;

  return (
    <div className="rounded-3xl p-5 text-[#FFFBEB] shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold opacity-90">نشاطك</p>
        {/* Manual refresh so stale stats can be updated without a full reload (#442). */}
        <button
          onClick={() => { rm(); rf(); }}
          disabled={fm || ff}
          title="تحديث"
          className="text-xs opacity-80 hover:opacity-100 disabled:opacity-50 transition-opacity"
        >
          {fm || ff ? '⏳' : '↻'}
        </button>
      </div>
      {isError ? (
        // Don't blank/crash on a failed stats fetch (#439).
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
            // Empty state for brand-new users instead of a wall of zeros (#376).
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
          <h1 className="text-xl font-bold text-[#059669]">الرئيسية</h1>
          <p className="text-sm text-[#10B981]">آخر المنشورات من مجتمعاتك</p>
        </div>
        <PostFeed />
      </div>

      <aside className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-[5.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin space-y-5 pr-1">
          <ProfileCompleteness />
          <QuickStats />
          <QuickActions />
          <SuggestedConnections />
          <TrendingTopics />
        </div>
      </aside>
    </div>
  );
}
