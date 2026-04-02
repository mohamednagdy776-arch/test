import Link from 'next/link';

// ─── SVG Decorative Elements ──────────────────────────────────
const CrescentMoon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10C30 10 15 30 15 50s15 40 35 40c-5-5-8-12-8-20s3-15 8-20c-5-5-8-12-8-20s3-15 8-20z" fill="currentColor" opacity="0.15"/>
    <circle cx="50" cy="18" r="3" fill="currentColor" opacity="0.1"/>
    <circle cx="35" cy="50" r="2" fill="currentColor" opacity="0.08"/>
    <circle cx="65" cy="35" r="2.5" fill="currentColor" opacity="0.1"/>
  </svg>
);

const GeometricPattern = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <pattern id="islamic" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 0L40 20L20 40L0 20Z" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
    </pattern>
    <rect width="200" height="200" fill="url(#islamic)"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
);

// ─── Decorative Islamic Border ────────────────────────────────
const IslamicDivider = () => (
  <div className="flex items-center justify-center gap-3 py-2">
    <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#94B4C1]/40" />
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#94B4C1]" fill="currentColor">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
    </svg>
    <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#94B4C1]/40" />
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#EAE0CF' }}>

      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION — Dark navy frosted glass
          ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-[#C8D8DF]/20" style={{ background: 'rgba(19,31,46,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[#FDFAF5] font-bold text-sm shadow-lg" style={{ background: 'linear-gradient(135deg, #547792, #94B4C1)' }}>
              ط
            </div>
            <span className="text-xl font-bold text-[#FDFAF5] tracking-tight">طيبت</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-[#94B4C1] hover:text-[#FDFAF5] transition-colors">المميزات</a>
            <a href="#how" className="text-[#94B4C1] hover:text-[#FDFAF5] transition-colors">كيف يعمل</a>
            <a href="#stories" className="text-[#94B4C1] hover:text-[#FDFAF5] transition-colors">قصص النجاح</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-[#94B4C1] hover:text-[#FDFAF5] transition-colors">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="rounded-xl px-5 py-2 text-sm font-semibold text-[#131F2E] shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]" style={{ background: '#94B4C1' }}>
              انضم مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Luxury gradient with geometric patterns
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #131F2E 0%, #213448 40%, #547792 100%)' }}>
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <GeometricPattern className="w-full h-full text-[#94B4C1]" />
        </div>

        {/* Decorative floating orbs */}
        <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full blur-[100px]" style={{ background: '#547792', opacity: 0.2 }} />
        <div className="absolute bottom-20 right-[15%] h-80 w-80 rounded-full blur-[120px]" style={{ background: '#94B4C1', opacity: 0.15 }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full blur-[140px]" style={{ background: '#547792', opacity: 0.1 }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold mb-8 backdrop-blur-sm" style={{ borderColor: '#547792', background: 'rgba(84,119,146,0.15)', color: '#94B4C1' }}>
                <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: '#4A8C6F' }} />
                +10,000 مستخدم نشط الآن
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6" style={{ color: '#FDFAF5' }}>
                ابحث عن شريك
                <br />
                <span style={{ background: 'linear-gradient(to left, #94B4C1, #EAE0CF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>حياتك المثالي</span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-lg leading-relaxed mb-10" style={{ color: '#94B4C1' }}>
                منصة طيبت تجمع بين الذكاء الاصطناعي والقيم الإسلامية لمساعدتك في إيجاد شريك الحياة المناسب — بأمان وخصوصية تامة.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto rounded-2xl px-10 py-4 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] text-center" style={{ background: 'linear-gradient(135deg, #94B4C1, #547792)', color: '#131F2E' }}>
                  ابدأ رحلتك مجاناً
                </Link>
                <Link href="/login" className="w-full sm:w-auto rounded-2xl border-2 px-8 py-4 text-base font-bold transition-colors text-center" style={{ borderColor: '#547792', color: '#94B4C1' }}>
                  تسجيل الدخول
                </Link>
              </div>

              {/* Trust bar */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2" style={{ background: 'linear-gradient(135deg, #547792, #94B4C1)', color: '#FDFAF5', borderColor: '#131F2E' }}>
                      {['أ','م','ف','ي','ع'][i-1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5" style={{ color: '#C9923A' }}>
                    {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
                  </div>
                  <p className="text-xs" style={{ color: '#94B4C1' }}>4.9/5 من +2,000 تقييم</p>
                </div>
              </div>
            </div>

            {/* Right: Phone Mockup with luxury feel */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[280px] h-[560px] rounded-[2.5rem] p-3 shadow-2xl" style={{ background: 'linear-gradient(160deg, #131F2E, #213448)' }}>
                  <div className="w-full h-full rounded-[2rem] overflow-hidden relative" style={{ background: '#EAE0CF' }}>
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-3 text-xs font-semibold" style={{ color: '#213448' }}>
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="#213448" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                        <svg className="h-3 w-3" fill="#213448" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                      </div>
                    </div>

                    {/* App content */}
                    <div className="px-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>ط</div>
                        <span className="text-sm font-bold" style={{ color: '#213448' }}>طيبت</span>
                      </div>

                      {/* Stories */}
                      <div className="flex gap-3">
                        {['أ','م','ف','ي'].map((l, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: i === 0 ? 'linear-gradient(135deg, #547792, #94B4C1)' : '#C8D8DF', color: i === 0 ? '#FDFAF5' : '#547792', padding: i === 0 ? '2px' : '0' }}>
                              {i === 0 ? <div className="h-full w-full rounded-full flex items-center justify-center" style={{ background: '#EAE0CF', color: '#213448' }}>{l}</div> : l}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Post cards */}
                      <div className="rounded-2xl p-3 shadow-sm" style={{ background: '#FDFAF5' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#D4E8EE', color: '#213448' }}>ف</div>
                          <span className="text-xs font-bold" style={{ color: '#213448' }}>فاطمة</span>
                          <span className="text-[10px] mr-auto" style={{ color: '#BFB9AD' }}>2 د</span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#547792' }}>الحمد لله وجدت نصيبي هنا</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#D4E8EE', color: '#547792' }}>❤️ 24</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#EAE0CF', color: '#BFB9AD' }}>💬 8</span>
                        </div>
                      </div>

                      <div className="rounded-2xl p-3 shadow-sm" style={{ background: '#FDFAF5' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#D4E8EE', color: '#213448' }}>أ</div>
                          <span className="text-xs font-bold" style={{ color: '#213448' }}>أحمد</span>
                          <span className="text-[10px] mr-auto" style={{ color: '#BFB9AD' }}>15 د</span>
                        </div>
                        <p className="text-[11px]" style={{ color: '#547792' }}>نصائح للتوافق الناجح في الزواج...</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#D4E8EE', color: '#547792' }}>👍 56</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#EAE0CF', color: '#BFB9AD' }}>💬 12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification cards */}
                <div className="absolute -top-6 -right-10 rounded-2xl p-3 shadow-xl animate-float" style={{ background: '#FDFAF5' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: '#D4E8EE' }}>
                      <span style={{ color: '#B05252' }}><HeartIcon /></span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#213448' }}>توافق جديد!</p>
                      <p className="text-[10px]" style={{ color: '#547792' }}>95% توافق</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-10 rounded-2xl p-3 shadow-xl animate-float" style={{ background: '#FDFAF5', animationDelay: '3s' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: '#D4E8EE' }}>
                      <span style={{ color: '#547792' }}><ChatIcon /></span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#213448' }}>رسالة جديدة</p>
                      <p className="text-[10px]" style={{ color: '#547792' }}>مرحباً بك!</p>
                    </div>
                  </div>
                </div>

                {/* Crescent decoration */}
                <div className="absolute -top-16 -left-16 w-24 h-24 text-[#94B4C1] opacity-20">
                  <CrescentMoon />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="relative h-16">
          <svg viewBox="0 0 1440 64" fill="none" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 32C240 64 480 0 720 32C960 64 1200 0 1440 32V64H0V32Z" fill="#EAE0CF"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS — Elegant counter bar
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: '#EAE0CF' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '+10,000', label: 'مستخدم مسجل', icon: <UsersIcon /> },
              { value: '+5,000', label: 'توافق ناجح', icon: <HeartIcon /> },
              { value: '95%', label: 'نسبة الرضا', icon: <StarIcon /> },
              { value: '24/7', label: 'دعم متواصل', icon: <ShieldIcon /> },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-transform group-hover:scale-110" style={{ background: '#D4E8EE', color: '#213448' }}>
                  {s.icon}
                </div>
                <p className="text-3xl sm:text-4xl font-bold" style={{ color: '#213448' }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: '#547792' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <IslamicDivider />

      {/* ═══════════════════════════════════════════════════════════
          FEATURES — Premium card grid
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24" style={{ backgroundColor: '#EAE0CF' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#547792' }}>لماذا طيبت؟</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#213448' }}>تجربة زواج آمنة وذكية</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#547792' }}>نقدم لك منصة متكاملة تجمع بين التكنولوجيا الحديثة والقيم الإسلامية الأصيلة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <SparklesIcon />, title: 'توافق بالذكاء الاصطناعي', desc: 'خوارزميات متقدمة تراعي القيم الدينية والثقافية والاجتماعية لإيجاد الشريك المثالي' },
              { icon: <LockIcon />, title: 'خصوصية وأمان', desc: 'بياناتك محمية بأعلى معايير الأمان مع التحكم الكامل في من يرى ملفك الشخصي' },
              { icon: <UsersIcon />, title: 'إشراف أهلي', desc: 'إمكانية إشراك أولياء الأمور في عملية البحث والموافقة لضمان التوافق العائلي' },
              { icon: <ChatIcon />, title: 'محادثات آمنة', desc: 'تواصل آمن مع مرشحي التوافق مع إمكانية مراقبة المحادثات وفق الضوابط الشرعية' },
              { icon: <ChartIcon />, title: 'تقارير معمقة', desc: 'تحليلات تفصيلية لدرجات التوافق في مختلف الجوانب الدينية والثقافية والاجتماعية' },
              { icon: <ShieldIcon />, title: 'ملتزم بالضوابط', desc: 'كل شيء مصمم وفق الضوابط الشرعية الإسلامية لضمان تجربة زواج حلال' },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF', boxShadow: '0 2px 12px rgba(33,52,72,0.08)' }}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110" style={{ background: '#D4E8EE', color: '#213448' }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#213448' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#547792' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — Elegant 3-step flow
          ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="py-24" style={{ background: 'linear-gradient(160deg, #213448, #547792)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#94B4C1' }}>خطوات بسيطة</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#FDFAF5' }}>كيف يعمل طيبت؟</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'أنشئ ملفك', desc: 'سجل واملأ ملفك الشخصي ببياناتك وتفضيلاتك في أقل من 5 دقائق' },
              { step: '02', title: 'احصل على توصيات', desc: 'الذكاء الاصطناعي يحلل ويقترح أفضل المرشحين المتوافقين معك' },
              { step: '03', title: 'تواصل وتعرف', desc: 'تحدث مع المرشحين في بيئة آمنة وابدأ رحلتك نحو الزواج' },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold mb-6" style={{ background: 'rgba(148,180,193,0.15)', color: '#94B4C1', border: '1px solid rgba(148,180,193,0.2)' }}>
                  {s.step}
                </div>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px" style={{ background: 'linear-gradient(to right, rgba(148,180,193,0.3), transparent)' }} />
                )}
                <h3 className="text-lg font-bold mb-2" style={{ color: '#FDFAF5' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94B4C1' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SUCCESS STORIES — Warm testimonial cards
          ═══════════════════════════════════════════════════════════ */}
      <section id="stories" className="py-24" style={{ backgroundColor: '#EAE0CF' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#547792' }}>قصص حقيقية</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#213448' }}>نجاحات طيبت</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { names: 'أحمد & فاطمة', text: 'الحمد لله وجدت نصيبي في طيبت. التوافق كان ممتاز والערכים كانت مشتركة بشكل مذهل.', city: 'القاهرة', match: '96%', initials: 'أف' },
              { names: 'يوسف & مريم', text: 'تجربة رائعة من البداية للنهاية. الخصوصية والأمان اللي توفرها المنصة خلتني أرتاح تماماً.', city: 'جدة', match: '92%', initials: 'يم' },
              { names: 'علي & نور', text: 'أنصح الجميع بطيبت. طريقة التوافق بالذكاء الاصطناعي كانت دقيقة ومبنية على أسس صحيحة.', city: 'دبي', match: '94%', initials: 'عن' },
            ].map((s) => (
              <div key={s.names} className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF', boxShadow: '0 2px 12px rgba(33,52,72,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)', color: '#213448' }}>
                    {s.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#213448' }}>{s.names}</p>
                    <p className="text-xs" style={{ color: '#BFB9AD' }}>{s.city}</p>
                  </div>
                  <span className="mr-auto text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(74,140,111,0.15)', color: '#4A8C6F' }}>
                    <CheckIcon /> {s.match}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#547792' }}>&quot;{s.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Luxury dark section
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #131F2E, #213448)' }}>
        <div className="absolute inset-0 opacity-5">
          <GeometricPattern className="w-full h-full text-[#94B4C1]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-6" style={{ background: 'rgba(148,180,193,0.15)', color: '#94B4C1' }}>
            <HeartIcon />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#FDFAF5' }}>هل أنت مستعد لإيجاد شريك حياتك؟</h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#94B4C1' }}>انضم إلى آلاف المسلمين الذين وجدوا توافقهم من خلال طيبت — مجاناً تماماً</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #94B4C1, #547792)', color: '#131F2E' }}>
            ابدأ رحلتك الآن
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — Deep navy with warm accents
          ═══════════════════════════════════════════════════════════ */}
      <footer className="py-12" style={{ background: '#131F2E', borderTop: '1px solid rgba(84,119,146,0.2)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style={{ background: 'linear-gradient(135deg, #547792, #94B4C1)', color: '#131F2E' }}>ط</div>
              <span className="text-sm font-bold" style={{ color: '#EAE0CF' }}>طيبت</span>
              <span className="text-sm" style={{ color: '#BFB9AD' }}>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#94B4C1' }}>
              <Link href="/login" className="hover:text-[#FDFAF5] transition-colors font-medium">تسجيل الدخول</Link>
              <Link href="/register" className="hover:text-[#FDFAF5] transition-colors font-medium">إنشاء حساب</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
