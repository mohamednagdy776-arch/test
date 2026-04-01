import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))]/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md">
              ط
            </div>
            <span className="text-xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">طيبت</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            <a href="#features" className="hover:text-[hsl(var(--foreground))] transition-colors">المميزات</a>
            <a href="#how" className="hover:text-[hsl(var(--foreground))] transition-colors">كيف يعمل</a>
            <a href="#stories" className="hover:text-[hsl(var(--foreground))] transition-colors">قصص نجاح</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
              دخول
            </Link>
            <Link href="/register" className="rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
              انضم مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-10 left-10 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-[100px]" />
        <div className="absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-indigo-100/30 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-100/20 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-6 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                +10,000 مستخدم نشط الآن
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[hsl(var(--foreground))] leading-[1.1] mb-6">
                ابحث عن شريك
                <br />
                <span className="bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">حياتك المثالي</span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mb-8">
                منصة طيبت تجمع بين الذكاء الاصطناعي والقيم الإسلامية لمساعدتك في إيجاد شريك الحياة المناسب — بأمان وخصوصية تامة.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto rounded-2xl bg-gradient-to-l from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-center">
                  ابدأ رحلتك مجاناً ✨
                </Link>
                <Link href="/login" className="w-full sm:w-auto rounded-2xl border-2 border-[hsl(var(--border))] px-8 py-4 text-base font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors text-center">
                  تسجيل الدخول
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6">
                <div className="flex -space-x-2 space-x-reverse">
                  {['👨', '👩', '👨‍🦱', '👩‍🦰', '👨‍💼'].map((e, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm ring-2 ring-white">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm">{'★'.repeat(5)}</div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">4.9/5 من +2,000 تقييم</p>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-[280px] h-[560px] rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-gray-800 p-3 shadow-2xl">
                  <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-3 text-xs font-semibold text-gray-800">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <span>📶</span><span>🔋</span>
                      </div>
                    </div>
                    {/* App preview */}
                    <div className="px-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">ط</div>
                        <span className="text-sm font-bold text-gray-800">طيبت</span>
                      </div>
                      {/* Stories */}
                      <div className="flex gap-3">
                        {['👨‍💼', '👩‍🦰', '👨‍🦱', '👩‍🎓'].map((e, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`h-12 w-12 rounded-full ${i === 0 ? 'bg-gradient-to-br from-pink-400 to-orange-400 p-[2px]' : 'bg-gray-200'} flex items-center justify-center text-lg`}>
                              {i === 0 && <div className="h-full w-full rounded-full bg-white flex items-center justify-center">{e}</div>}
                              {i !== 0 && e}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Cards */}
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">👩</div>
                          <span className="text-xs font-bold text-gray-800">فاطمة</span>
                          <span className="text-[10px] text-gray-400 mr-auto">2 د</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">الحمد لله وجدت نصيبي هنا 🤍</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">❤️ 24</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">💬 8</span>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">👨</div>
                          <span className="text-xs font-bold text-gray-800">أحمد</span>
                          <span className="text-[10px] text-gray-400 mr-auto">15 د</span>
                        </div>
                        <p className="text-[11px] text-gray-600">نصائح للتوافق الناجح في الزواج الإسلامي...</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">👍 56</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">💬 12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-8 rounded-2xl bg-white shadow-elevated p-3 animate-float">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💖</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">توافق جديد!</p>
                      <p className="text-[10px] text-gray-500">95% توافق</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-8 rounded-2xl bg-white shadow-elevated p-3 animate-float" style={{ animationDelay: '3s' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">رسالة جديدة</p>
                      <p className="text-[10px] text-gray-500">مرحباً!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-[hsl(var(--border))]/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '+10,000', label: 'مستخدم مسجل', icon: '👥' },
              { value: '+5,000', label: 'توافق ناجح', icon: '💍' },
              { value: '95%', label: 'نسبة الرضا', icon: '⭐' },
              { value: '24/7', label: 'دعم متواصل', icon: '🛡️' },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))]">{s.value}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#faf9f7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">لماذا طيبت؟</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))]">تجربة زواج آمنة وذكية</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'توافق بالذكاء الاصطناعي', desc: 'خوارزميات متقدمة تراعي القيم الدينية والثقافية والاجتماعية لإيجاد الشريك المثالي', color: 'from-blue-500 to-indigo-600' },
              { icon: '🔒', title: 'خصوصية وأمان', desc: 'بياناتك محمية بأعلى معايير الأمان مع التحكم الكامل في من يرى ملفك', color: 'from-emerald-500 to-teal-600' },
              { icon: '👨‍👩‍👧', title: 'إشراف أهلي', desc: 'إمكانية إشراك أولياء الأمور في عملية البحث والموافقة', color: 'from-rose-500 to-pink-600' },
              { icon: '💬', title: 'محادثات آمنة', desc: 'تواصل آمن مع مرشحي التوافق مع إمكانية مراقبة المحادثات', color: 'from-amber-500 to-orange-600' },
              { icon: '📊', title: 'تقارير معمقة', desc: 'تحليلات تفصيلية لدرجات التوافق في مختلف الجوانب الدينية والثقافية', color: 'from-purple-500 to-violet-600' },
              { icon: '🕌', title: 'ملتزم بالضوابط', desc: 'كل شيء مصمم وفق الضوابط الشرعية الإسلامية', color: 'from-cyan-500 to-blue-600' },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-2xl bg-white p-6 shadow-card border border-[hsl(var(--border))]/60 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white text-xl shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">{f.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">خطوات بسيطة</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))]">كيف يعمل طيبت؟</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'أنشئ ملفك', desc: 'سجل واملأ ملفك الشخصي ببياناتك وتفضيلاتك', icon: '📝' },
              { step: '2', title: 'احصل على توصيات', desc: 'الذكاء الاصطناعي يحلل ويقترح أفضل المرشحين المتوافقين', icon: '🎯' },
              { step: '3', title: 'تواصل وتعرف', desc: 'تحدث مع المرشحين وابدأ رحلتك نحو الزواج', icon: '💬' },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-transparent" style={{ transform: 'translateX(50%)', width: '50%' }} />
                )}
                <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-4xl mb-4 ring-4 ring-white shadow-card">
                  {s.icon}
                </div>
                <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[hsl(var(--primary))] text-white text-xs font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">{s.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="py-20 bg-[#faf9f7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">قصص حقيقية</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))]">نجاحات طيبت</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { names: 'أحمد & فاطمة', text: 'الحمد لله وجدت نصيبي في طيبت. التوافق كان ممتاز والערכים مشتركة.', city: 'القاهرة', match: '96%', emoji: '💑' },
              { names: 'يوسف & مريم', text: 'تجربة رائعة. الخصوصية والأمان اللي توفرها المنصة خلتني أرتاح.', city: 'جدة', match: '92%', emoji: '💒' },
              { names: 'علي & نور', text: 'أنصح الجميع بطيبت. طريقة التوافق بالذكاء الاصطناعي مذهلة.', city: 'دبي', match: '94%', emoji: '💍' },
            ].map((s) => (
              <div key={s.names} className="rounded-2xl bg-white p-6 shadow-card border border-[hsl(var(--border))]/60">
                <div className="text-4xl mb-4">{s.emoji}</div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">"{s.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]/40">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--foreground))]">{s.names}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.city}</p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full ring-1 ring-inset ring-emerald-600/20">
                    توافق {s.match}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-10 sm:p-16 text-white text-center shadow-elevated overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">هل أنت مستعد لإيجاد شريك حياتك؟</h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">انضم إلى آلاف المسلمين الذين وجدوا توافقهم من خلال طيبت — مجاناً تماماً</p>
              <Link href="/register" className="inline-flex rounded-2xl bg-white px-10 py-4 text-base font-bold text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
                ابدأ رحلتك الآن 🚀
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))]/60 py-10 bg-[#faf9f7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs">ط</div>
              <span className="text-sm font-bold text-[hsl(var(--foreground))]">طيبت</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
              <Link href="/login" className="hover:text-[hsl(var(--foreground))] transition-colors font-medium">تسجيل الدخول</Link>
              <Link href="/register" className="hover:text-[hsl(var(--foreground))] transition-colors font-medium">إنشاء حساب</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
