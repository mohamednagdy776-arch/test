'use client';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { cn } from '@/lib/utils';

// ─── Right Sidebar: Suggested Connections ─────────────────────
function SuggestedConnections() {
  const suggestions = [
    { name: 'سارة أحمد', age: 25, city: 'القاهرة', emoji: '👩‍🎓', match: 92 },
    { name: 'يوسف محمد', age: 28, city: 'جدة', emoji: '👨‍💼', match: 87 },
    { name: 'هدى علي', age: 24, city: 'دبي', emoji: '👩‍⚕️', match: 85 },
    { name: 'عمر خالد', age: 30, city: 'الرياض', emoji: '👨‍💻', match: 81 },
  ];

  return (
    <div className="rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#C8D8DF]/40">
        <h3 className="text-sm font-bold text-[#213448]">أشخاص قد تعرفهم</h3>
      </div>
      <div className="p-3 space-y-1">
        {suggestions.map((s) => (
          <div key={s.name} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#D4E8EE]/50 transition-colors group cursor-pointer">
            <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#213448] truncate">{s.name}</p>
              <p className="text-[11px] text-[#547792]">{s.age} سنة · {s.city}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                s.match >= 90 ? 'bg-[#4A8C6F]/15 text-[#4A8C6F]' : s.match >= 85 ? 'bg-[#D4E8EE] text-[#547792]' : 'bg-[#C9923A]/15 text-[#C9923A]'
              )}>
                {s.match}%
              </span>
              <button className="text-[10px] font-semibold text-[#547792] hover:text-[#213448] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                عرض
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-[#C8D8DF]/40">
        <button className="w-full rounded-xl border border-[#C8D8DF] py-2 text-xs font-semibold text-[#547792] hover:bg-[#D4E8EE]/50 hover:text-[#213448] transition-colors">
          عرض المزيد
        </button>
      </div>
    </div>
  );
}

// ─── Right Sidebar: Trending Topics ───────────────────────────
function TrendingTopics() {
  const topics = [
    { tag: '#الزواج_الإسلامي', posts: 234, image: '💍', color: 'from-rose-100 to-rose-200' },
    { tag: '#قصص_نجاح', posts: 187, image: '🏆', color: 'from-amber-100 to-amber-200' },
    { tag: '#نصائح_للعروسين', posts: 156, image: '💒', color: 'from-pink-100 to-pink-200' },
    { tag: '#توافق', posts: 142, image: '💕', color: 'from-purple-100 to-purple-200' },
  ];

  return (
    <div className="rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#C8D8DF]/40">
        <h3 className="text-sm font-bold text-[#213448]">🔥 المواضيع الرائجة</h3>
      </div>
      <div className="p-3 space-y-1">
        {topics.map((t, i) => (
          <button key={t.tag} className="w-full text-right rounded-xl p-2.5 hover:bg-[#D4E8EE]/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-inner-soft',
                'bg-gradient-to-br', t.color
              )}>
                {t.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#547792]">{t.tag}</p>
                  <span className="text-[10px] text-[#BFB9AD] font-medium">#{i + 1}</span>
                </div>
                <p className="text-[11px] text-[#BFB9AD]">{t.posts} منشور</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Stats Banner (COLOR_SYSTEM.md palette) ────────────
function QuickStats() {
  return (
    <div className="rounded-2xl p-5 text-[#FDFAF5] shadow-elevated" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
      <p className="text-sm font-bold opacity-90 mb-3">نشاطك اليوم</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">12</p>
          <p className="text-[10px] opacity-70">مشاهدات</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">3</p>
          <p className="text-[10px] opacity-70">إعجابات</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">1</p>
          <p className="text-[10px] opacity-70">توافق</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex gap-6">
      {/* Main Feed */}
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#213448]">الرئيسية</h1>
          <p className="text-sm text-[#547792]">آخر المنشورات من مجتمعاتك</p>
        </div>
        <PostFeed />
      </div>

      {/* Right Sidebar — scrollable */}
      <aside className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-[5.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin space-y-5 pr-1">
          <QuickStats />
          <SuggestedConnections />
          <TrendingTopics />
        </div>
      </aside>
    </div>
  );
}
