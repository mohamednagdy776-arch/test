import Link from 'next/link';

// ─── SVG Icons (Heroicons style) ──────────────────────────────
const Icons = {
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
  sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zm-13.5 0a2.625 2.625 0 11-5.25 0 2.625 2.625 0 014.5 0z"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd"/></svg>,
};

// ─── Unsplash Image URLs ──────────────────────────────────────
const Images = {
  hero: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80', // couple hands
  couple1: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80', // happy couple walking
  couple2: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&q=80', // couple laughing
  couple3: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', // couple sunset
  mosque: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80', // beautiful mosque
  hands: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80', // ring hands
  profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', // man portrait
  profile2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', // woman portrait
  profile3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', // man portrait 2
  nature: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', // nature landscape
};

export default function Home() {
  return (
    <main className="overflow-x-hidden" style={{ backgroundColor: '#FDFAF5' }}>

      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION — Clean white with mist accents
          ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: '#C8D8DF', background: 'rgba(253,250,245,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #213448, #547792)', color: '#FDFAF5' }}>
              ط
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#213448' }}>طيبت</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <a href="#features" style={{ color: '#547792' }} className="hover:text-[#213448] transition-colors">المميزات</a>
            <a href="#how" style={{ color: '#547792' }} className="hover:text-[#213448] transition-colors">كيف يعمل</a>
            <a href="#stories" style={{ color: '#547792' }} className="hover:text-[#213448] transition-colors">قصص النجاح</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors" style={{ color: '#213448' }}>
              تسجيل الدخول
            </Link>
            <Link href="/register" className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]" style={{ background: '#213448', color: '#FDFAF5' }}>
              انضم مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Light, warm, with real image
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#FDFAF5' }}>
        {/* Soft gradient background */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(212,232,238,0.5) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(234,224,207,0.6) 0%, transparent 50%)' }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-8" style={{ background: '#D4E8EE', color: '#213448' }}>
                <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: '#4A8C6F' }} />
                +10,000 مستخدم نشط الآن
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] mb-6" style={{ color: '#213448' }}>
                ابحث عن شريك
                <br />
                <span style={{ background: 'linear-gradient(to left, #213448, #547792)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>حياتك المثالي</span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-lg leading-relaxed mb-10" style={{ color: '#547792' }}>
                منصة طيبت تجمع بين الذكاء الاصطناعي والقيم الإسلامية لمساعدتك في إيجاد شريك الحياة المناسب — بأمان وخصوصية تامة.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto rounded-2xl px-10 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-center" style={{ background: '#213448', color: '#FDFAF5' }}>
                  ابدأ رحلتك مجاناً
                </Link>
                <Link href="/login" className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-semibold transition-all duration-200 text-center flex items-center justify-center gap-2" style={{ border: '2px solid #C8D8DF', color: '#213448' }}>
                  <span style={{ color: '#547792' }}>{Icons.play}</span>
                  شاهد كيف يعمل
                </Link>
              </div>

              {/* Trust bar */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6">
                <div className="flex -space-x-2 space-x-reverse">
                  {[Images.profile, Images.profile2, Images.profile3].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-9 w-9 rounded-full object-cover border-2" style={{ borderColor: '#FDFAF5' }} />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5" style={{ color: '#C9923A' }}>
                    {[1,2,3,4,5].map(i => <span key={i}>{Icons.star}</span>)}
                  </div>
                  <p className="text-xs" style={{ color: '#547792' }}>4.9/5 من +2,000 تقييم</p>
                </div>
              </div>
            </div>

            {/* Hero image collage */}
            <div className="hidden lg:block relative">
              <div className="relative w-full max-w-md mx-auto">
                {/* Main large image */}
                <div className="rounded-3xl overflow-hidden shadow-xl" style={{ border: '4px solid #FDFAF5' }}>
                  <img src={Images.couple1} alt="زوجان سعيدان" className="w-full h-80 object-cover" />
                </div>

                {/* Small floating image top-left */}
                <div className="absolute -top-4 -left-8 w-28 h-28 rounded-2xl overflow-hidden shadow-lg animate-float" style={{ border: '3px solid #FDFAF5' }}>
                  <img src={Images.couple2} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Small floating image bottom-right */}
                <div className="absolute -bottom-4 -right-8 w-32 h-32 rounded-2xl overflow-hidden shadow-lg animate-float" style={{ border: '3px solid #FDFAF5', animationDelay: '2s' }}>
                  <img src={Images.hands} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Match card floating */}
                <div className="absolute -top-6 -right-4 rounded-2xl p-3 shadow-xl" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: '#D4E8EE' }}>
                      <span style={{ color: '#B05252' }}>{Icons.heart}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#213448' }}>توافق جديد!</p>
                      <p className="text-[10px]" style={{ color: '#4A8C6F' }}>95% توافق</p>
                    </div>
                  </div>
                </div>

                {/* Stats card floating */}
                <div className="absolute -bottom-6 -left-4 rounded-2xl p-3 shadow-xl" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: '#D4E8EE' }}>
                      <span style={{ color: '#547792' }}>{Icons.chat}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#213448' }}>+5000</p>
                      <p className="text-[10px]" style={{ color: '#547792' }}>زواج ناجح</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS — Clean bar with icons
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 border-y" style={{ borderColor: '#C8D8DF', background: 'linear-gradient(135deg, #D4E8EE, #EAE0CF)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '+10,000', label: 'مستخدم مسجل', icon: Icons.users },
              { value: '+5,000', label: 'توافق ناجح', icon: Icons.heart },
              { value: '95%', label: 'نسبة الرضا', icon: Icons.sparkles },
              { value: '24/7', label: 'دعم متواصل', icon: Icons.shield },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-transform group-hover:scale-110" style={{ background: '#FDFAF5', color: '#213448', boxShadow: '0 2px 8px rgba(33,52,72,0.08)' }}>
                  {s.icon}
                </div>
                <p className="text-3xl sm:text-4xl font-bold" style={{ color: '#213448' }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: '#547792' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES — Light cards with image accent
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24" style={{ backgroundColor: '#FDFAF5' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#94B4C1' }}>لماذا طيبت؟</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#213448' }}>تجربة زواج آمنة وذكية</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#547792' }}>نقدم لك منصة متكاملة تجمع بين التكنولوجيا الحديثة والقيم الإسلامية الأصيلة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Icons.sparkles, title: 'توافق بالذكاء الاصطناعي', desc: 'خوارزميات متقدمة تراعي القيم الدينية والثقافية والاجتماعية لإيجاد الشريك المثالي', accent: '#547792' },
              { icon: Icons.lock, title: 'خصوصية وأمان', desc: 'بياناتك محمية بأعلى معايير الأمان مع التحكم الكامل في من يرى ملفك الشخصي', accent: '#4A8C6F' },
              { icon: Icons.users, title: 'إشراف أهلي', desc: 'إمكانية إشراك أولياء الأمور في عملية البحث والموافقة لضمان التوافق العائلي', accent: '#C9923A' },
              { icon: Icons.chat, title: 'محادثات آمنة', desc: 'تواصل آمن مع مرشحي التوافق مع إمكانية مراقبة المحادثات وفق الضوابط الشرعية', accent: '#B05252' },
              { icon: Icons.chart, title: 'تقارير معمقة', desc: 'تحليلات تفصيلية لدرجات التوافق في مختلف الجوانب الدينية والثقافية والاجتماعية', accent: '#547792' },
              { icon: Icons.shield, title: 'ملتزم بالضوابط', desc: 'كل شيء مصمم وفق الضوابط الشرعية الإسلامية لضمان تجربة زواج حلال', accent: '#213448' },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF', boxShadow: '0 1px 3px rgba(33,52,72,0.04)' }}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110" style={{ background: `${f.accent}15`, color: f.accent }}>
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
          HOW IT WORKS — Light section with image
          ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="py-24" style={{ background: '#EAE0CF' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Steps */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#547792' }}>خطوات بسيطة</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-10" style={{ color: '#213448' }}>كيف يعمل طيبت؟</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'أنشئ ملفك الشخصي', desc: 'سجل واملأ ملفك ببياناتك وتفضيلاتك في أقل من 5 دقائق' },
                  { step: '02', title: 'احصل على توصيات ذكية', desc: 'الذكاء الاصطناعي يحلل ويقترح أفضل المرشحين المتوافقين معك' },
                  { step: '03', title: 'تواصل في بيئة آمنة', desc: 'تحدث مع مرشحي التوافق وابدأ رحلتك نحو الزواج بنجاح' },
                ].map((s, i) => (
                  <div key={s.step} className="flex items-start gap-5">
                    <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl text-lg font-bold" style={{ background: '#FDFAF5', color: '#213448', border: '1px solid #C8D8DF' }}>
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#213448' }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#547792' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ border: '4px solid #FDFAF5' }}>
                <img src={Images.couple3} alt="زوجان" className="w-full h-96 object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(33,52,72,0.4), transparent)' }} />
                <div className="absolute bottom-6 right-6 left-6">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(253,250,245,0.95)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center gap-3">
                      <img src={Images.profile2} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#213448' }}>وجدت توافقي خلال أسبوع!</p>
                        <div className="flex items-center gap-1" style={{ color: '#C9923A' }}>
                          {[1,2,3,4,5].map(i => <span key={i} className="h-3 w-3">{Icons.star}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SUCCESS STORIES — With real images
          ═══════════════════════════════════════════════════════════ */}
      <section id="stories" className="py-24" style={{ backgroundColor: '#FDFAF5' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#94B4C1' }}>قصص حقيقية</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#213448' }}>نجاحات طيبت</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { names: 'أحمد & فاطمة', text: 'الحمد لله وجدت نصيبي في طيبت. التوافق كان ممتاز والערכים كانت مشتركة بشكل مذهل. أنصح الجميع بالتجربة.', city: 'القاهرة', match: '96%' },
              { names: 'يوسف & مريم', text: 'تجربة رائعة من البداية للنهاية. الخصوصية والأمان اللي توفرها المنصة خلتني أرتاح تماماً.', city: 'جدة', match: '92%' },
              { names: 'علي & نور', text: 'طريقة التوافق بالذكاء الاصطناعي كانت دقيقة ومبنية على أسس صحيحة. الحمد لله وجدت شريكة حياتي.', city: 'دبي', match: '94%' },
            ].map((s, i) => (
              <div key={s.names} className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF', boxShadow: '0 1px 3px rgba(33,52,72,0.04)' }}>
                {/* Image header */}
                <div className="h-40 relative overflow-hidden">
                  <img src={[Images.couple1, Images.couple2, Images.couple3][i]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(33,52,72,0.5), transparent)' }} />
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(253,250,245,0.95)', color: '#4A8C6F' }}>
                      {Icons.check} توافق {s.match}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#547792' }}>"{s.text}"</p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #C8D8DF' }}>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#D4E8EE', color: '#213448' }}>
                      {s.names.split(' ')[0][0]}{s.names.split('&')[1]?.[1] || ''}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#213448' }}>{s.names}</p>
                      <p className="text-xs" style={{ color: '#BFB9AD' }}>{s.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          APP PREVIEW — Show the product
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: '#EAE0CF' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#547792' }}>التطبيق</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#213448' }}>تجربة سلسة ومميزة</h2>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              {[
                { title: 'البحث الذكي', desc: 'ابحث عن شريكك المثالي بمعايير دقيقة', img: Images.mosque },
                { title: 'التوافق', desc: 'تعرف على درجة توافقك مع كل مرشح', img: Images.hands },
                { title: 'المحادثات', desc: 'تواصل آمن ومريح مع مرشحي التوافق', img: Images.couple2 },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: '#FDFAF5', border: '1px solid #C8D8DF' }}>
                  <div className="h-40 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold mb-1" style={{ color: '#213448' }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: '#547792' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Mist gradient, inviting
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)' }}>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-6" style={{ background: '#FDFAF5', color: '#213448' }}>
            {Icons.heart}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#213448' }}>هل أنت مستعد لإيجاد شريك حياتك؟</h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#213448', opacity: 0.7 }}>انضم إلى آلاف المسلمين الذين وجدوا توافقهم من خلال طيبت — مجاناً تماماً</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]" style={{ background: '#213448', color: '#FDFAF5' }}>
            ابدأ رحلتك الآن
            {Icons.arrow}
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — Clean and simple
          ═══════════════════════════════════════════════════════════ */}
      <footer className="py-12" style={{ background: '#213448' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style={{ background: '#547792', color: '#FDFAF5' }}>ط</div>
              <span className="text-sm font-bold" style={{ color: '#FDFAF5' }}>طيبت</span>
              <span className="text-sm" style={{ color: '#94B4C1' }}>© {new Date().getFullYear()}</span>
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
