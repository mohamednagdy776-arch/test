'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { useSuggestions } from '@/features/friends/hooks';
import { apiClient } from '@/lib/api-client';
import { cn, displayName } from '@/lib/utils';

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
              <div className="h-10 w-10 rounded-2xl bg-[#DCFCE7]" />
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
                <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-base font-bold text-white shadow-soft bg-gradient-to-br from-emerald-400 to-emerald-600">
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

function TrendingTopics() {
  const topics = [
    { tag: '#الزواج_الإسلامي', posts: 234, image: '💍', color: 'from-green-100 to-emerald-200' },
    { tag: '#قصص_نجاح', posts: 187, image: '🏆', color: 'from-amber-100 to-yellow-200' },
    { tag: '#نصائح_للعروسين', posts: 156, image: '💒', color: 'from-pink-100 to-rose-200' },
    { tag: '#توافق', posts: 142, image: '💕', color: 'from-purple-100 to-violet-200' },
  ];

  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DCFCE7]/40">
        <h3 className="text-sm font-bold text-[#059669]">🔥 المواضيع الرائجة</h3>
      </div>
      <div className="p-3 space-y-1">
        {topics.map((t, i) => (
          <button key={t.tag} className="w-full text-right rounded-2xl p-2.5 hover:bg-[#DCFCE7]/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-inner',
                'bg-gradient-to-br', t.color
              )}>
                {t.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#10B981]">{t.tag}</p>
                  <span className="text-[10px] text-[#6EE7B7] font-medium">#{i + 1}</span>
                </div>
                <p className="text-[11px] text-[#A7F3D0]">{t.posts} منشور</p>
              </div>
            </div>
          </button>
        ))}
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
  const { data: matchesData, isLoading: ml, isError: me } = useQuery({
    queryKey: ['dashboard-matches-count'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const { data: friendsData, isLoading: fl, isError: fe } = useQuery({
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
      <p className="text-sm font-bold opacity-90 mb-3">نشاطك</p>
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
          <QuickStats />
          <QuickActions />
          <SuggestedConnections />
          <TrendingTopics />
        </div>
      </aside>
    </div>
  );
}
