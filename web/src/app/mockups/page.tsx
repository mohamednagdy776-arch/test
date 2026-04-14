'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type MockupVariant = 'soft-dreamy' | 'elegant-classic' | 'modern-minimal' | 'playful-warm' | 'luxe-premium' | 'fresh-natural';

interface PageMockup {
  id: string;
  name: string;
  route: string;
  description: string;
}

const pages: PageMockup[] = [
  { id: 'home', name: 'Home/Landing', route: '/', description: 'Hero, features, testimonials, CTA' },
  { id: 'dashboard', name: 'Dashboard', route: '/dashboard', description: 'Stats, activity feed, quick actions' },
  { id: 'profile', name: 'Profile', route: '/profile', description: 'Header, bio, photos, interests' },
  { id: 'search', name: 'Search', route: '/search', description: 'Filters sidebar, results grid' },
  { id: 'upgrade', name: 'Upgrade', route: '/upgrade', description: 'Pricing plans, comparison' },
];

const variants: { id: MockupVariant; name: string; description: string }[] = [
  { id: 'soft-dreamy', name: 'Soft Dreamy', description: 'Soft gradients, gentle shadows, rounded cards' },
  { id: 'elegant-classic', name: 'Elegant Classic', description: 'Structured layout, subtle borders, refined typography' },
  { id: 'modern-minimal', name: 'Modern Minimal', description: 'Clean lines, ample whitespace, bold accents' },
  { id: 'playful-warm', name: 'Playful Warm', description: 'Warm gold tones, friendly elements, soft radius' },
  { id: 'luxe-premium', name: 'Luxe Premium', description: 'Dark accents, gold highlights, elegant serif' },
  { id: 'fresh-natural', name: 'Fresh Natural', description: 'Nature-inspired, organic shapes, calm greens' },
];

export default function MockupsPage() {
  const [activeVariant, setActiveVariant] = useState<MockupVariant>('soft-dreamy');
  const [activePage, setActivePage] = useState<string>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tayyibt Mockups</h1>
              <p className="text-xs text-slate-500">Soft Pastels Theme • Emerald #10B981 • Gold #F59E0B</p>
            </div>
            <div className="flex gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeVariant === v.id
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <nav className="w-48 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2 sticky top-20">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Pages</h3>
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all ${
                    activePage === page.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page.name}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto bg-white rounded-full px-4 py-1 text-xs text-slate-500 shadow-sm">
                  tayyibt.com{activePage === 'home' ? '' : pages.find(p => p.id === activePage)?.route}
                </div>
              </div>
              <div className="p-6 min-h-[600px] bg-slate-50">
                {activePage === 'home' && <HomeMockup variant={activeVariant} />}
                {activePage === 'dashboard' && <DashboardMockup variant={activeVariant} />}
                {activePage === 'profile' && <ProfileMockup variant={activeVariant} />}
                {activePage === 'search' && <SearchMockup variant={activeVariant} />}
                {activePage === 'upgrade' && <UpgradeMockup variant={activeVariant} />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===================== HOMEPAGE MOCKUP =====================
function HomeMockup({ variant }: { variant: MockupVariant }) {
  const colors = getVariantColors(variant);
  
  return (
    <div className="rounded-2xl overflow-hidden bg-white" style={{ minHeight: '550px' }}>
      <div className="relative" style={{ background: colors.heroGradient }}>
        <nav className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: colors.primary }}>
              ط
            </div>
            <span className="text-xl font-bold text-white">طيبة</span>
          </div>
          <div className="flex items-center gap-4">
            {['المميزات', 'قصص النجاح', 'اتصل بنا'].map((item) => (
              <button key={item} className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                {item}
              </button>
            ))}
            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-emerald-600 hover:shadow-md transition-all">
              تسجيل الدخول
            </button>
          </div>
        </nav>

        <div className="px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
            Find Your Perfect Match
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            منصة زواج إسلامية تسعى لت帮助 you find your ideal partner with dignity and respect
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 rounded-xl font-semibold text-emerald-600 shadow-lg hover:shadow-xl transition-all" style={{ background: colors.accent }}>
              ابدأ الآن مجاناً
            </button>
            <button className="px-8 py-3 rounded-xl font-semibold border-2 border-white text-white hover:bg-white/10 transition-all">
              اعرف المزيد
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)' }} />
      </div>

      <div className="px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: colors.textPrimary }}>
          مميزات منصة طيبة
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '🔍', title: 'Smart Matching', desc: 'Advanced AI algorithm finds compatible partners' },
            { icon: '🛡️', title: 'Verified Profiles', desc: 'All profiles manually verified for authenticity' },
            { icon: '💬', title: 'Secure Chat', desc: 'Private messaging with encryption' },
          ].map((feature, i) => (
            <div key={i} className="text-center p-6 rounded-2xl" style={{ background: colors.cardBg, border: colors.cardBorder }}>
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: colors.textPrimary }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-12" style={{ background: colors.sectionBg }}>
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: colors.textPrimary }}>
          قصص النجاح
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            { name: 'أحمد & سارة', text: 'وجدنا بعضنا في طيبة والحمد لله', location: 'القاهرة', emoji: '💕' },
            { name: 'عمر & أميرة', text: 'شكراً للمنصة على مساعدة Husband finding', location: 'جدة', emoji: '💍' },
          ].map((story, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{story.emoji}</span>
                <div>
                  <p className="font-bold" style={{ color: colors.textPrimary }}>{story.name}</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{story.location}</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>"{story.text}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
          ابدأ رحلتك اليوم
        </h2>
        <p className="mb-6" style={{ color: colors.textSecondary }}>انضم إلى thousands of singles looking for marriage</p>
        <button className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg" style={{ background: colors.primary }}>
          إنشاء حساب مجاني
        </button>
      </div>

      <footer className="px-6 py-6 text-center text-sm" style={{ background: colors.footerBg, color: colors.footerText }}>
        <p>© 2026 Tayyibt. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ===================== DASHBOARD MOCKUP =====================
function DashboardMockup({ variant }: { variant: MockupVariant }) {
  const colors = getVariantColors(variant);
  
  return (
    <div className="rounded-2xl overflow-hidden bg-white flex" style={{ minHeight: '550px' }}>
      <aside className="w-64 bg-white border-l" style={{ borderColor: colors.border }}>
        <div className="p-4 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: colors.primary }}>
              ط
            </div>
            <span className="text-lg font-bold" style={{ color: colors.textPrimary }}>طيبة</span>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {[
            { icon: '🏠', label: 'الرئيسية' },
            { icon: '🔍', label: 'بحث' },
            { icon: '❤️', label: 'توافقات' },
            { icon: '💬', label: 'رسائل' },
            { icon: '👥', label: 'أصدقاء' },
            { icon: '⚙️', label: 'إعدادات' },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${i === 0 ? 'text-white shadow-md' : 'hover:bg-slate-100'}`}
              style={i === 0 ? { background: colors.primary } : { color: colors.textSecondary }}>
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>مرحباً، أحمد</h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>آخر النشاطات</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: colors.primary }}>
              أ
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'توافقات', value: '12', icon: '❤️', color: 'bg-pink-100 text-pink-600' },
            { label: 'رسائل', value: '3', icon: '💬', color: 'bg-blue-100 text-blue-600' },
            { label: 'مشاهدات', value: '48', icon: '👁️', color: 'bg-purple-100 text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl" style={{ background: colors.cardBg, border: colors.cardBorder }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: colors.textSecondary }}>{stat.label}</span>
                <span className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: colors.textPrimary }}>النشاطات الأخيرة</h2>
            <button className="text-sm" style={{ color: colors.primary }}>عرض الكل</button>
          </div>
          <div className="space-y-3">
            {[
              { user: 'سارة', action: 'شاهدت ملفك', time: 'منذ 5 دقائق', avatar: '👩' },
              { user: 'يوسف', action: 'أرسل طلب صداقة', time: 'منذ ساعة', avatar: '👨' },
              { user: 'أميرة', action: 'راسلتكم', time: 'منذ ساعتين', avatar: '👩' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: colors.cardBg }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.accent }}>
                  {activity.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3" style={{ color: colors.textPrimary }}>أفعال سريعة</h2>
          <div className="grid grid-cols-3 gap-3">
            {['🔍 بحث متقدم', '✉️ رسالة جديدة', '📸 أضف صورة'].map((action, i) => (
              <button key={i} className="p-3 rounded-xl text-sm font-medium text-center transition-colors"
                style={{ background: colors.accent, color: colors.textPrimary }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ===================== PROFILE MOCKUP =====================
function ProfileMockup({ variant }: { variant: MockupVariant }) {
  const colors = getVariantColors(variant);
  
  return (
    <div className="rounded-2xl overflow-hidden bg-white" style={{ minHeight: '550px' }}>
      <div className="relative h-40" style={{ background: colors.heroGradient }}>
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl border-4 border-white shadow-lg" style={{ background: colors.primary }}>
            👨
          </div>
        </div>
        <button className="absolute top-4 left-4 px-4 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-colors">
          ✏️ تعديل
        </button>
      </div>

      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>أحمد محمد</h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>28 سنة •工程师 • القاهرة</p>
            <div className="flex gap-2 mt-2">
              {['✓ موثق', '✓ مفعل'].map((badge, i) => (
                <span key={i} className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: colors.accent, color: colors.primary }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: colors.border, color: colors.textSecondary }}>
              💬 message
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: colors.primary }}>
              ❤️ توافق
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-2" style={{ color: colors.textPrimary }}>نبذة عني</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
            مهندس برمجيات، أبحث عن شريكة حياة مخلصة تشاركني الحب والخير. أحب التكنولوجيا والقراءة والطبخ.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-3" style={{ color: colors.textPrimary }}>الصور</h2>
          <div className="grid grid-cols-4 gap-2">
            {['🖼️', '🖼️', '🖼️', '➕'].map((img, i) => (
              <div key={i} className="aspect-square rounded-xl flex items-center justify-center text-2xl" style={{ background: colors.cardBg }}>
                {img}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3" style={{ color: colors.textPrimary }}>الاهتمامات</h2>
          <div className="flex flex-wrap gap-2">
            {['📚 قراءة', '🍳 cooking', '✈️ travel', '💻 technology', '🏋️ sport', '🎵 music'].map((tag, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-sm" style={{ background: colors.accent, color: colors.textPrimary }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== SEARCH MOCKUP =====================
function SearchMockup({ variant }: { variant: MockupVariant }) {
  const colors = getVariantColors(variant);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  return (
    <div className="rounded-2xl overflow-hidden bg-white flex" style={{ minHeight: '550px' }}>
      <aside className="w-64 bg-white border-l p-4" style={{ borderColor: colors.border }}>
        <h2 className="font-bold mb-4" style={{ color: colors.textPrimary }}>Filters</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: colors.textSecondary }}>العمر</label>
            <div className="flex gap-2">
              <input type="text" placeholder="من" className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: colors.border }} />
              <input type="text" placeholder="إلى" className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: colors.border }} />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: colors.textSecondary }}>الدولة</label>
            <select className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: colors.border }}>
              <option>كل الدول</option>
              <option>السعودية</option>
              <option>مصر</option>
              <option>الإمارات</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: colors.textSecondary }}>الحالة الاجتماعية</label>
            {['أعزب', 'مطلق', 'أرمل'].map((opt, i) => (
              <label key={i} className="flex items-center gap-2 py-1">
                <input type="checkbox" className="rounded" style={{ accentColor: colors.primary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>{opt}</span>
              </label>
            ))}
          </div>
          
          <button className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: colors.primary }}>
            تطبيق
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <input type="text" placeholder="Search..." className="w-full p-2.5 rounded-xl border text-sm" style={{ borderColor: colors.border }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              ⊞
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              ☰
            </button>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>248 نتيجة</p>

        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-3' : 'space-y-3'}>
          {[
            { name: 'سارة أحمد', age: 25, city: 'القاهرة', match: 92, emoji: '👩' },
            { name: 'يوسف محمد', age: 28, city: 'جدة', match: 87, emoji: '👨' },
            { name: 'هدى علي', age: 24, city: 'دبي', match: 85, emoji: '👩' },
            { name: 'عمر خالد', age: 30, city: 'الرياض', match: 81, emoji: '👨' },
            { name: 'منى أحمد', age: 26, city: 'القاهرة', match: 78, emoji: '👩' },
            { name: 'فارس عمر', age: 29, city: 'الكويت', match: 75, emoji: '👨' },
          ].map((user, i) => (
            <div key={i} className={`bg-white rounded-xl p-3 ${viewMode === 'grid' ? 'shadow-sm' : 'flex items-center gap-3 shadow-sm'}`}
              style={{ border: colors.cardBorder }}>
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square rounded-xl flex items-center justify-center mb-2" style={{ background: colors.accent }}>
                    <span className="text-4xl">{user.emoji}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold" style={{ color: colors.textPrimary }}>{user.name}</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>{user.age} • {user.city}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
                      {user.match}% توافق
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: colors.accent }}>
                    <span className="text-xl">{user.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: colors.textPrimary }}>{user.name}</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>{user.age} • {user.city}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
                    {user.match}%
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ===================== UPGRADE MOCKUP =====================
function UpgradeMockup({ variant }: { variant: MockupVariant }) {
  const colors = getVariantColors(variant);
  const [selected, setSelected] = useState('premium');
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Free',
      features: ['Create profile', 'Basic search', '5 matches/day', 'Join communities'],
      color: '#94B4C1',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$99',
      features: ['All Free features', 'Unlimited matches', 'Deep analytics', 'Priority search', 'Premium badge', 'Priority support'],
      color: '#10B981',
      popular: true,
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '$149',
      features: ['All Premium features', '3 sub-accounts', 'Parent supervision', 'Monthly reports', 'Dedicated consultant'],
      color: '#F59E0B',
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden bg-white p-8" style={{ minHeight: '550px' }}>
      <div className="text-center mb-8">
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ background: colors.accent, color: colors.primary }}>
          ✨ Upgrade Your Account
        </span>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>Choose the Right Plan</h1>
        <p className="" style={{ color: colors.textSecondary }}>Get exclusive features for advanced matching</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${selected === plan.id ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
            style={{
              borderColor: selected === plan.id ? plan.color : colors.border,
              background: selected === plan.id ? colors.cardBg : 'white',
            }}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: plan.color }}>
                Most Popular
              </div>
            )}
            <div className="text-center mb-4 pt-2">
              <p className="font-bold mb-1" style={{ color: colors.textSecondary }}>{plan.name}</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold" style={{ color: colors.textPrimary }}>{plan.price}</span>
                {plan.price !== 'Free' && <span className="text-sm" style={{ color: colors.textSecondary }}>/mo</span>}
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                  <svg className="w-4 h-4 shrink-0" style={{ color: plan.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: selected === plan.id ? plan.color : 'transparent',
                color: selected === plan.id ? 'white' : colors.textSecondary,
                border: `1px solid ${plan.color}`,
              }}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="text-sm" style={{ color: colors.textSecondary }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// ===================== VARIANT COLORS =====================
function getVariantColors(variant: MockupVariant) {
  switch (variant) {
    case 'soft-dreamy':
      return {
        primary: '#10B981',
        secondary: '#F59E0B',
        heroGradient: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
        accent: '#ECFDF5',
        cardBg: '#FFFFFF',
        cardBorder: '1px solid #E5E7EB',
        sectionBg: '#F9FAFB',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        footerBg: '#1F2937',
        footerText: '#9CA3AF',
      };
    case 'elegant-classic':
      return {
        primary: '#213448',
        secondary: '#547792',
        heroGradient: 'linear-gradient(180deg, #213448 0%, #547792 100%)',
        accent: '#F3F4F6',
        cardBg: '#FFFFFF',
        cardBorder: '1px solid #D1D5DB',
        sectionBg: '#F9FAFB',
        textPrimary: '#1F2937',
        textSecondary: '#4B5563',
        border: '#D1D5DB',
        footerBg: '#1F2937',
        footerText: '#9CA3AF',
      };
    case 'modern-minimal':
      return {
        primary: '#10B981',
        secondary: '#F59E0B',
        heroGradient: '#10B981',
        accent: '#F0FDF4',
        cardBg: '#FFFFFF',
        cardBorder: '1px solid #E5E7EB',
        sectionBg: '#FAFAFA',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        footerBg: '#111827',
        footerText: '#9CA3AF',
      };
    case 'playful-warm':
      return {
        primary: '#F59E0B',
        secondary: '#10B981',
        heroGradient: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
        accent: '#FEF3C7',
        cardBg: '#FFFBEB',
        cardBorder: '1px solid #FDE68A',
        sectionBg: '#FEFCE8',
        textPrimary: '#92400E',
        textSecondary: '#B45309',
        border: '#FDE68A',
        footerBg: '#92400E',
        footerText: '#FDE68A',
      };
    case 'luxe-premium':
      return {
        primary: '#1F2937',
        secondary: '#D4AF37',
        heroGradient: 'linear-gradient(180deg, #1F2937 0%, #374151 100%)',
        accent: '#FEF9E7',
        cardBg: '#FAFAFA',
        cardBorder: '1px solid #E5E7EB',
        sectionBg: '#F3F4F6',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        footerBg: '#111827',
        footerText: '#9CA3AF',
      };
    case 'fresh-natural':
      return {
        primary: '#059669',
        secondary: '#10B981',
        heroGradient: 'linear-gradient(180deg, #059669 0%, #10B981 100%)',
        accent: '#ECFDF5',
        cardBg: '#F0FDF4',
        cardBorder: '1px solid #BBF7D0',
        sectionBg: '#F0FDF4',
        textPrimary: '#14532D',
        textSecondary: '#166534',
        border: '#BBF7D0',
        footerBg: '#14532D',
        footerText: '#86EFAC',
      };
  }
}