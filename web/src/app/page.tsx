'use client';
import Link from 'next/link';

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

const Images = {
  hero: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80',
  couple1: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80',
  couple2: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&q=80',
  couple3: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80',
  mosque: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80',
  hands: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80',
  profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  profile2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  profile3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
};

export default function Home() {
  return (
    <main className="overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 50%, #F0FDF4 100%)' }}>

      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: '#DCFCE7', background: 'rgba(240,253,244,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl font-bold text-sm shadow-soft" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#FFFBEB' }}>
              ط
            </div>
            <span className="text-xl font-bold tracking-tight text-[#059669]">طيبت</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-[#10B981] hover:text-[#059669] transition-colors">المميزات</a>
            <a href="#how" className="text-[#10B981] hover:text-[#059669] transition-colors">كيف يعمل</a>
            <a href="#stories" className="text-[#10B981] hover:text-[#059669] transition-colors">قصص النجاح</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-2xl px-4 py-2 text-sm font-semibold transition-colors text-[#10B981] hover:text-[#059669]">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="rounded-2xl px-5 py-2.5 text-sm font-semibold shadow-soft hover:shadow-lg transition-all duration-200 active:scale-[0.98]" style={{ background: '#10B981', color: '#FFFBEB' }}>
              انضم مجاناً
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(167,243,208,0.4) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(220,252,231,0.6) 0%, transparent 50%)' }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-8" style={{ background: '#DCFCE7', color: '#059669' }}>
                <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                +10,000 مستخدم نشط الآن
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] mb-6 text-[#059669]">
                ابحث عن شريك
                <br />
                <span style={{ background: 'linear-gradient(to left, #10B981, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>حياتك المثالي</span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-lg leading-relaxed mb-10 text-[#10B981]">
                منصة طيبت تجمع بين الذكاء الاصطناعي والقيم الإسلامية لمساعدتك في إيجاد شريك الحياة المناسب — بأمان وخصوصية تامة.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto rounded-2xl px-10 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-center" style={{ background: '#10B981', color: '#FFFBEB' }}>
                  ابدأ رحلتك مجاناً
                </Link>
                <Link href="/login" className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-semibold transition-all duration-200 text-center flex items-center justify-center gap-2" style={{ border: '2px solid #DCFCE7', color: '#059669' }}>
                  <span className="text-[#10B981]">{Icons.play}</span>
                  شاهد كيف يعمل
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6">
                <div className="flex -space-x-2 space-x-reverse">
                  {[Images.profile, Images.profile2, Images.profile3].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-9 w-9 rounded-full object-cover border-2" style={{ borderColor: '#FFFBEB' }} />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5" style={{ color: '#F59E0B' }}>
                    {[1,2,3,4,5].map(i => <span key={i}>{Icons.star}</span>)}
                  </div>
                  <p className="text-xs text-[#10B981]">4.9/5 من +2,000 تقييم</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="rounded-3xl overflow-hidden shadow-xl" style={{ border: '4px solid #FFFBEB' }}>
                  <img src={Images.couple1} alt="زوجان سعيدان" className="w-full h-80 object-cover" />
                </div>

                <div className="absolute -top-4 -left-8 w-28 h-28 rounded-2xl overflow-hidden shadow-lg animate-float" style={{ border: '3px solid #FFFBEB' }}>
                  <img src={Images.couple2} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="absolute -bottom-4 -right-8 w-32 h-32 rounded-2xl overflow-hidden shadow-lg animate-float" style={{ border: '3px solid #FFFBEB', animationDelay: '2s' }}>
                  <img src={Images.hands} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="absolute -top-6 -right-4 rounded-2xl p-3 shadow-xl" style={{ background: '#FFFBEB', border: '1px solid #DCFCE7' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                      <span style={{ color: '#EF4444' }}>{Icons.heart}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#059669]">توافق جديد!</p>
                      <p className="text-[10px]" style={{ color: '#10B981' }}>95% توافق</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-4 rounded-2xl p-3 shadow-xl" style={{ background: '#FFFBEB', border: '1px solid #DCFCE7' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                      <span className="text-[#10B981]">{Icons.chat}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#059669]">+5000</p>
                      <p className="text-[10px] text-[#10B981]">زواج ناجح</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y" style={{ borderColor: '#DCFCE7', background: 'linear-gradient(135deg, #DCFCE7, #F0FDF4)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '+10,000', label: 'مستخدم مسجل', icon: Icons.users },
              { value: '+5,000', label: 'توافق ناجح', icon: Icons.heart },
              { value: '95%', label: 'نسبة الرضا', icon: Icons.sparkles },
              { value: '24/7', label: 'دعم متواصل', icon: Icons.shield },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-transform group-hover:scale-110" style={{ background: '#FFFBEB', color: '#10B981', boxShadow: '0 2px 8px rgba(16,185,129,0.1)' }}>
                  {s.icon}
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-[#059669]">{s.value}</p>
                <p className="text-sm mt-1 text-[#10B981]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFBEB 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#6EE7B7]">لماذا طيبت؟</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#059669]">تجربة زواج آمنة وذكية</h2>
            <p className="text-lg max-w-2xl mx-auto text-[#10B981]">نقدم لك منصة متكاملة تجمع بين التكنولوجيا الحديثة والقيم الإسلامية الأصيلة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Icons.sparkles, title: 'توافق بالذكاء الاصطناعي', desc: 'خوارزميات متقدمة تراعي القيم الدينية والثقافية والاجتماعية لإيجاد الشريك المثالي', accent: '#10B981' },
              { icon: Icons.lock, title: 'خصوصية وأمان', desc: 'بياناتك محمية بأعلى معايير الأمان مع التحكم الكامل في من يرى ملفك الشخصي', accent: '#34D399' },
              { icon: Icons.users, title: 'إشراف أهلي', desc: 'إمكانية إشراك أولياء الأمور في عملية البحث والموافقة لضمان التوافق العائلي', accent: '#F59E0B' },
              { icon: Icons.chat, title: 'محادثات آمنة', desc: 'تواصل آمن مع مرشحي التوافق مع إمكانية مراقبة المحادثات وفق الضوابط الشرعية', accent: '#10B981' },
              { icon: Icons.chart, title: 'تقارير معمقة', desc: 'تحليلات تفصيلية لدرجات التوافق في مختلف الجوانب الدينية والثقافية والاجتماعية', accent: '#34D399' },
              { icon: Icons.shield, title: 'ملتزم بالضوابط', desc: 'كل شيء مصمم وفق الضوابط الشرعية الإسلامية لضمان تجربة زواج حلال', accent: '#059669' },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ background: '#FFFBEB', border: '1px solid #DCFCE7', boxShadow: '0 1px 3px rgba(16,185,129,0.04)' }}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110" style={{ background: `${f.accent}15`, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#059669]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#10B981]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24" style={{ background: 'linear-gradient(180deg, #DCFCE7 0%, #F0FDF4 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#10B981]">خطوات بسيطة</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-[#059669]">كيف يعمل طيبت؟</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'أنشئ ملفك الشخصي', desc: 'سجل واملأ ملفك ببياناتك وتفضيلاتك في أقل من 5 دقائق' },
                  { step: '02', title: 'احصل على توصيات ذكية', desc: 'الذكاء الاصطناعي يحلل ويقترح أفضل المرشحين المتوافقين معك' },
                  { step: '03', title: 'تواصل في بيئة آمنة', desc: 'تحدث مع مرشحي التوافق وابدأ رحلتك نحو الزواج بنجاح' },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-5">
                    <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl text-lg font-bold" style={{ background: '#FFFBEB', color: '#059669', border: '1px solid #DCFCE7' }}>
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-[#059669]">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-[#10B981]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ border: '4px solid #FFFBEB' }}>
                <img src={Images.couple3} alt="زوجان" className="w-full h-96 object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,150,105,0.4), transparent)' }} />
                <div className="absolute bottom-6 right-6 left-6">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,251,235,0.95)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center gap-3">
                      <img src={Images.profile2} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold text-[#059669]">وجدت توافقي خلال أسبوع!</p>
                        <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
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

      <section id="stories" className="py-24" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFBEB 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#6EE7B7]">قصص حقيقية</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#059669]">نجاحات طيبت</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { names: 'أحمد & فاطمة', text: 'الحمد لله وجدت نصيبي في طيبت. التوافق كان ممتاز والقيم كانت مشتركة بشكل مذهل. أنصح الجميع بالتجربة.', city: 'القاهرة', match: '96%' },
              { names: 'يوسف & مريم', text: 'تجربة رائعة من البداية للنهاية. الخصوصية والأمان اللي توفرها المنصة خلتني أرتاح تماماً.', city: 'جدة', match: '92%' },
              { names: 'علي & نور', text: 'طريقة التوافق بالذكاء الاصطناعي كانت دقيقة ومبنية على أسس صحيحة. الحمد لله وجدت شريكة حياتي.', city: 'دبي', match: '94%' },
            ].map((s, i) => (
              <div key={s.names} className="rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ background: '#FFFBEB', border: '1px solid #DCFCE7', boxShadow: '0 1px 3px rgba(16,185,129,0.04)' }}>
                <div className="h-40 relative overflow-hidden">
                  <img src={[Images.couple1, Images.couple2, Images.couple3][i]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,150,105,0.5), transparent)' }} />
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,251,235,0.95)', color: '#10B981' }}>
                      {Icons.check} توافق {s.match}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed mb-4 text-[#10B981]">"{s.text}"</p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #DCFCE7' }}>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#DCFCE7', color: '#059669' }}>
                      {s.names.split(' ')[0][0]}{s.names.split('&')[1]?.[1] || ''}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#059669]">{s.names}</p>
                      <p className="text-xs text-[#6EE7B7]">{s.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: 'linear-gradient(180deg, #DCFCE7 0%, #F0FDF4 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#10B981]">التطبيق</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#059669]">تجربة سلسة ومميزة</h2>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              {[
                { title: 'البحث الذكي', desc: 'ابحث عن شريكك المثالي بمعايير دقيقة', img: Images.mosque },
                { title: 'التوافق', desc: 'تعرف على درجة توافقك مع كل مرشح', img: Images.hands },
                { title: 'المحادثات', desc: 'تواصل آمن ومريح مع مرشحي التوافق', img: Images.couple2 },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: '#FFFBEB', border: '1px solid #DCFCE7' }}>
                  <div className="h-40 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold mb-1 text-[#059669]">{item.title}</h3>
                    <p className="text-sm text-[#10B981]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: 'linear-gradient(135deg, #DCFCE7, #A7F3D0)' }}>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-6" style={{ background: '#FFFBEB', color: '#10B981' }}>
            {Icons.heart}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#059669]">هل أنت مستعد لإيجاد شريك حياتك؟</h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#065F46', opacity: 0.7 }}>انضم إلى آلاف المسلمين الذين وجدوا توافقهم من خلال طيبت — مجاناً تماماً</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]" style={{ background: '#10B981', color: '#FFFBEB' }}>
            ابدأ رحلتك الآن
            {Icons.arrow}
          </Link>
        </div>
      </section>

      <footer className="py-12" style={{ background: '#059669' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold" style={{ background: '#34D399', color: '#FFFBEB' }}>ط</div>
              <span className="text-sm font-bold text-[#FFFBEB]">طيبت</span>
              <span className="text-sm text-[#A7F3D0]">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#A7F3D0]">
              <Link href="/login" className="hover:text-[#FFFBEB] transition-colors font-medium">تسجيل الدخول</Link>
              <Link href="/register" className="hover:text-[#FFFBEB] transition-colors font-medium">إنشاء حساب</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
