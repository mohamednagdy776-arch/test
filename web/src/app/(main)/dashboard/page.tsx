'use client';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { cn } from '@/lib/utils';

function SuggestedConnections() {
  const suggestions = [
    { name: 'سارة أحمد', age: 25, city: 'القاهرة', emoji: '👩‍🎓', match: 92 },
    { name: 'يوسف محمد', age: 28, city: 'جدة', emoji: '👨‍💼', match: 87 },
    { name: 'هدى علي', age: 24, city: 'دبي', emoji: '👩‍⚕️', match: 85 },
    { name: 'عمر خالد', age: 30, city: 'الرياض', emoji: '👨‍💻', match: 81 },
  ];

  return (
    <div className="rounded-3xl bg-[#FFFBEB] shadow-soft border border-[#DCFCE7]/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DCFCE7]/40">
        <h3 className="text-sm font-bold text-[#059669]">أشخاص قد تعرفهم</h3>
      </div>
      <div className="p-3 space-y-1">
        {suggestions.map((s) => (
          <div key={s.name} className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-[#DCFCE7]/50 transition-colors group cursor-pointer">
            <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-soft" style={{ background: 'linear-gradient(135deg, #DCFCE7, #A7F3D0)' }}>
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#065F46] truncate">{s.name}</p>
              <p className="text-[11px] text-[#10B981]">{s.age} سنة · {s.city}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                s.match >= 90 ? 'bg-[#10B981]/15 text-[#059669]' : s.match >= 85 ? 'bg-[#DCFCE7] text-[#10B981]' : 'bg-[#FEF3C7] text-[#D97706]'
              )}>
                {s.match}%
              </span>
              <button className="text-[10px] font-semibold text-[#10B981] hover:text-[#059669] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                عرض
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-[#DCFCE7]/40">
        <button className="w-full rounded-2xl border border-[#DCFCE7] py-2 text-xs font-semibold text-[#10B981] hover:bg-[#DCFCE7]/50 hover:text-[#059669] transition-colors">
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

function QuickStats() {
  return (
    <div className="rounded-3xl p-5 text-[#FFFBEB] shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
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
          <SuggestedConnections />
          <TrendingTopics />
        </div>
      </aside>
    </div>
  );
}
