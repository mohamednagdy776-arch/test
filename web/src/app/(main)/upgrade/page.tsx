'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useActiveSubscription, useCreateSubscription, useCancelSubscription } from '@/features/subscriptions/hooks';

function PaymentModal({ plan, billingPeriod, onClose, onConfirm, isPending }: { plan: { id: string; name: string; price: string }; billingPeriod: 'monthly' | 'annual'; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  const [method, setMethod] = useState<'card' | 'apple_pay' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const canSubmit = method !== 'card' || (cardNumber.replace(/\s/g,'').length === 16 && expiry.length === 5 && cvv.length >= 3);

  // Mirror the annual-vs-monthly math shown on the plan cards — this modal
  // previously always showed the flat monthly `plan.price`/"شهر" regardless
  // of the selected billing period (#89).
  const isAnnual = billingPeriod === 'annual' && plan.price !== 'مجاناً';
  const displayPrice = isAnnual ? Math.round(Number(plan.price) * 10 / 12) : plan.price;
  const annualTotal = Math.round(Number(plan.price) * 10);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-[var(--card)] p-6 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[var(--foreground)]">إتمام الاشتراك — {plan.name}</h3>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] text-xl">✕</button>
        </div>
        <p className="text-2xl font-bold text-[var(--primary)] text-center">{displayPrice} ر.س <span className="text-sm font-normal text-[var(--muted-foreground)]">/ شهر</span></p>
        {isAnnual && (
          <p className="text-center text-xs text-[var(--muted-foreground)] -mt-3">يُدفع سنوياً {annualTotal} ر.س</p>
        )}

        <div className="flex gap-2">
          {(['card', 'apple_pay', 'bank'] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)} className={cn('flex-1 rounded-xl py-2 text-xs font-semibold transition-all', method === m ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]')}>
              {m === 'card' ? '💳 بطاقة' : m === 'apple_pay' ? ' Apple Pay' : '🏦 تحويل'}
            </button>
          ))}
        </div>

        {method === 'card' && (
          <div className="space-y-3">
            <input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="رقم البطاقة" dir="ltr" className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--primary)]" />
            <div className="flex gap-3">
              <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" dir="ltr" className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--primary)]" />
              <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="CVV" dir="ltr" className="w-20 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
        )}
        {method === 'apple_pay' && (
          <div className="rounded-xl bg-black text-white py-3 text-center text-sm font-semibold cursor-pointer hover:opacity-90">🍎 الدفع بـ Apple Pay</div>
        )}
        {method === 'bank' && (
          <div className="rounded-xl bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)] space-y-1 text-right">
            <p className="font-bold text-[var(--foreground)]">تحويل بنكي</p>
            <p>رقم الآيبان: SA00 1234 5678 9012 3456 7890</p>
            <p>اسم المستفيد: طيبت للتقنية</p>
            <p className="text-xs text-[var(--muted-foreground)]">أرسل إشعار التحويل للدعم بعد إتمامه</p>
          </div>
        )}

        <button onClick={onConfirm} disabled={!canSubmit || isPending} className="w-full rounded-2xl btn-theme-primary py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? 'جارٍ المعالجة...' : 'تأكيد الدفع'}
        </button>
        <p className="text-center text-[10px] text-[var(--muted-foreground)]">🔒 بياناتك محمية بتشفير SSL 256-bit</p>
      </div>
    </div>
  );
}

const plans = [
  {
    id: 'basic',
    name: 'أساسي',
    price: 'مجاناً',
    period: '',
    features: ['إنشاء ملف شخصي', 'البحث الأساسي', '5 توافقات يومياً', 'الانضمام لمجتمعات'],
    color: 'var(--primary)',
  },
  {
    id: 'premium',
    name: 'متميز',
    price: '99',
    period: 'شهرياً',
    features: ['كل ميزات الأساسي', 'توافقات غير محدودة', 'تحليلات معمقة', 'أولوية في البحث', 'شارة مميز', 'دعم ذو أولوية'],
    popular: true,
    color: 'var(--primary)',
  },
  {
    id: 'family',
    name: 'عائلي',
    price: '149',
    period: 'شهرياً',
    features: ['كل ميزات المتميز', '3 حسابات فرعية', 'إشراف ولي الأمر', 'تقارير شهرية', 'مستشار زواج مخصص'],
    color: '#F59E0B',
  },
];

const ALL_FEATURES = [
  { label: 'إنشاء ملف شخصي', basic: true, premium: true, family: true },
  { label: 'البحث الأساسي', basic: true, premium: true, family: true },
  { label: '5 توافقات يومياً', basic: true, premium: false, family: false },
  { label: 'توافقات غير محدودة', basic: false, premium: true, family: true },
  { label: 'تحليلات معمقة', basic: false, premium: true, family: true },
  { label: 'أولوية في البحث', basic: false, premium: true, family: true },
  { label: 'شارة مميز', basic: false, premium: true, family: true },
  { label: 'دعم ذو أولوية', basic: false, premium: true, family: true },
  { label: '3 حسابات فرعية', basic: false, premium: false, family: true },
  { label: 'إشراف ولي الأمر', basic: false, premium: false, family: true },
  { label: 'تقارير شهرية', basic: false, premium: false, family: true },
  { label: 'الانضمام لمجتمعات', basic: true, premium: true, family: true },
];

export default function UpgradePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('premium');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<typeof plans[0] | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);

  const { data: activeData, isLoading: activeLoading } = useActiveSubscription();
  const activeSub = activeData?.data;
  const activePlanId: string | null = activeSub?.planId ?? null;

  const createSub = useCreateSubscription();
  const cancelSub = useCancelSubscription();

  const handleSubscribe = (planId: string) => {
    if (planId === 'basic') return;
    const plan = plans.find(p => p.id === planId);
    if (plan) setPaymentPlan(plan);
  };

  const confirmPayment = async () => {
    if (!paymentPlan) return;
    setFeedback(null);
    try {
      await createSub.mutateAsync(paymentPlan.id);
      setPaymentPlan(null);
      setFeedback('تم الاشتراك بنجاح! 🎉');
    } catch (e: any) {
      setFeedback(e?.response?.data?.message ?? 'حدث خطأ، حاول مجدداً');
    }
  };

  const handleCancel = async () => {
    if (!activeSub?.id) return;
    setFeedback(null);
    try {
      await cancelSub.mutateAsync(activeSub.id);
      setFeedback('تم إلغاء الاشتراك.');
    } catch (e: any) {
      setFeedback(e?.response?.data?.message ?? 'حدث خطأ، حاول مجدداً');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {paymentPlan && (
        <PaymentModal
          plan={paymentPlan}
          billingPeriod={billingPeriod}
          onClose={() => setPaymentPlan(null)}
          onConfirm={confirmPayment}
          isPending={createSub.isPending}
        />
      )}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-1.5 text-sm font-semibold text-[var(--primary)] mb-4">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>
          ترقية حسابك
        </div>
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">اختر الخطة المناسبة</h1>
        <p className="text-[var(--primary)]">احصل على ميزات حصرية للتوافق المتقدم والبحث الذكي</p>
        {/* Billing period toggle */}
        <div className="inline-flex mt-5 rounded-xl bg-[var(--muted)] p-1 gap-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn('rounded-lg px-5 py-1.5 text-sm font-semibold transition-all', billingPeriod === 'monthly' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--primary)] hover:text-[var(--primary)]')}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={cn('rounded-lg px-5 py-1.5 text-sm font-semibold transition-all flex items-center gap-1.5', billingPeriod === 'annual' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--primary)] hover:text-[var(--primary)]')}
          >
            سنوي
            <span className="rounded-full bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5">وفّر 17%</span>
          </button>
        </div>
      </div>

      {activeLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-80 rounded-3xl bg-[var(--muted)] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrent = activePlanId === plan.id || (!activePlanId && plan.id === 'basic');
            return (
              <div
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  'relative rounded-3xl border-2 p-6 cursor-pointer transition-all duration-300',
                  selected === plan.id
                    ? 'border-[var(--primary)] shadow-lg bg-[var(--card)] scale-[1.02]'
                    : 'border-[var(--border)] bg-[var(--card)] shadow-soft hover:shadow-lg hover:border-[#6EE7B7]'
                )}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold text-[var(--card)]" style={{ background: 'var(--primary)' }}>
                    الأكثر شعبية
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--muted)] px-3 py-1 text-[10px] font-bold text-[var(--primary)]">
                    خطتك الحالية
                  </div>
                )}
                <div className="text-center mb-4 pt-2">
                  <p className="text-sm font-bold text-[var(--primary)] mb-1">{plan.name}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price === 'مجاناً' ? (
                      <span className="text-4xl font-bold text-[var(--primary)]">مجاناً</span>
                    ) : billingPeriod === 'annual' ? (
                      <>
                        <span className="text-4xl font-bold text-[var(--primary)]">{Math.round(Number(plan.price) * 10 / 12)}</span>
                        <span className="text-sm text-[var(--primary)]">ر.س / شهر</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-[var(--primary)]">{plan.price}</span>
                        {plan.period && <span className="text-sm text-[var(--primary)]">ر.س / {plan.period}</span>}
                      </>
                    )}
                  </div>
                  {billingPeriod === 'annual' && plan.price !== 'مجاناً' && (
                    <p className="text-xs text-[var(--primary)] mt-1">يُدفع سنوياً {Math.round(Number(plan.price) * 10)} ر.س</p>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                      <svg className="h-4 w-4 shrink-0" style={{ color: plan.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(plan.id); }}
                  disabled={isCurrent || createSub.isPending || plan.id === 'basic'}
                  className={cn(
                    'w-full rounded-2xl py-2.5 text-sm font-semibold transition-all duration-200',
                    isCurrent || plan.id === 'basic'
                      ? 'bg-[var(--muted)] text-[var(--primary)] cursor-default'
                      : selected === plan.id
                      ? 'text-[var(--card)] shadow-sm hover:shadow-md hover:opacity-90'
                      : 'border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--muted)]'
                  )}
                  style={!isCurrent && plan.id !== 'basic' && selected === plan.id ? { background: plan.color } : {}}
                >
                  {isCurrent ? 'نشط حالياً' : createSub.isPending && selected === plan.id ? 'جارٍ الاشتراك...' : 'اشترك الآن'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {feedback && (
        <div className={cn(
          'mb-6 rounded-2xl px-5 py-3 text-sm text-center font-medium',
          feedback.includes('خطأ') ? 'bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20' : 'bg-[var(--muted)] text-[var(--primary)] border border-[#A7F3D0]'
        )}>
          {feedback}
        </div>
      )}

      {activeSub && activeSub.planId !== 'basic' && (
        <div className="text-center mb-4 space-y-1">
          {(activeSub.endDate || activeSub.currentPeriodEnd) && (
            <p className="text-xs text-[var(--primary)]">
              ينتهي اشتراكك في:{' '}
              <span className="font-semibold">
                {new Date(activeSub.endDate || activeSub.currentPeriodEnd).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {' '}— ستبقى ميزاتك متاحة حتى ذلك التاريخ
            </p>
          )}
          <button
            onClick={handleCancel}
            disabled={cancelSub.isPending}
            className="text-sm text-[var(--destructive)]/70 hover:text-[var(--destructive)] transition-colors underline underline-offset-2 disabled:opacity-50"
          >
            {cancelSub.isPending ? 'جارٍ الإلغاء...' : 'إلغاء الاشتراك الحالي'}
          </button>
        </div>
      )}

      {/* Plan comparison table */}
      <div className="mb-8">
        <button onClick={() => setShowComparison(v => !v)} className="w-full flex items-center justify-between rounded-2xl bg-[var(--card)] border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--primary)]">
          <span>مقارنة الخطط</span>
          <span>{showComparison ? '▲' : '▼'}</span>
        </button>
        {showComparison && (
          <div className="mt-2 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)] w-1/2">الميزة</th>
                  {plans.map(p => <th key={p.id} className="px-4 py-3 font-bold text-[var(--primary)] text-center">{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((f, i) => (
                  <tr key={f.label} className={i % 2 === 0 ? 'bg-[var(--card)]' : 'bg-[var(--card)]'}>
                    <td className="px-4 py-2.5 text-[var(--foreground)]">{f.label}</td>
                    {(['basic', 'premium', 'family'] as const).map(k => (
                      <td key={k} className="px-4 py-2.5 text-center">
                        {f[k] ? <span className="text-[var(--primary)] font-bold">✓</span> : <span className="text-[var(--muted-foreground)]/70">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center">
        <button onClick={() => router.back()} className="text-sm text-[var(--primary)] hover:text-[var(--primary)] transition-colors">
          ← العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
