'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMyAffiliate, useCreateAffiliate } from '@/features/affiliates/hooks';
import { apiClient } from '@/lib/api-client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tayyibt.com';

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 text-center shadow-sm">
      <div className="text-3xl mb-1">{icon}</div>
      <p className="text-2xl font-bold text-[var(--primary)]">{value}</p>
      <p className="text-xs text-[var(--primary)] mt-0.5">{label}</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all bg-[var(--primary)] text-white hover:bg-[var(--primary)] active:scale-95"
      aria-label={copied ? 'تم النسخ' : 'نسخ'}
    >
      <span aria-live="polite" aria-atomic="true">{copied ? '✓ تم النسخ' : 'نسخ'}</span>
    </button>
  );
}

function WithdrawModal({ commission, onClose }: { commission: string; onClose: () => void }) {
  const [iban, setIban] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const MIN_PAYOUT = 50;
  const balance = parseFloat(commission);

  const handleRequest = async () => {
    if (!iban.trim() || !name.trim()) return;
    setSending(true);
    try {
      await apiClient.post('/affiliates/payout', { iban: iban.trim(), accountName: name.trim() });
      setDone(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل طلب السحب، يرجى المحاولة مجدداً');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-[var(--card)] p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--foreground)]">طلب سحب العمولة</h3>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]">✕</button>
        </div>
        {done ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-bold text-[var(--primary)]">تم إرسال طلب السحب</p>
            <p className="text-xs text-[var(--primary)] mt-1">سيتم مراجعة طلبك خلال 3-5 أيام عمل</p>
            <button onClick={onClose} className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white">حسناً</button>
          </div>
        ) : balance < MIN_PAYOUT ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm text-[var(--foreground)] font-medium">الحد الأدنى للسحب {MIN_PAYOUT} ر.س</p>
            <p className="text-xs text-[var(--primary)] mt-1">رصيدك الحالي: <span className="font-bold">{commission} ر.س</span></p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--primary)]">المبلغ المتاح للسحب: <span className="font-bold text-[var(--foreground)]">{commission} ر.س</span></p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--primary)] block mb-1">رقم الآيبان (IBAN)</label>
                <input value={iban} onChange={e => setIban(e.target.value)} placeholder="SA..." className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] bg-[var(--card)]" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--primary)] block mb-1">اسم صاحب الحساب</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم كما في البنك" className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] bg-[var(--card)]" />
              </div>
              <button onClick={handleRequest} disabled={!iban.trim() || !name.trim() || sending} className="w-full rounded-2xl py-3 font-bold text-white text-sm btn-theme-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? 'جارٍ الإرسال...' : 'تأكيد طلب السحب'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AffiliateDashboard({ affiliate }: { affiliate: any }) {
  const referralLink = `${APP_URL}?ref=${affiliate.referralCode}`;
  const commission = Number(affiliate.commissionBalance ?? 0).toFixed(2);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}>
        <p className="text-sm font-semibold opacity-80 mb-1">برنامج الإحالة</p>
        <h2 className="text-2xl font-bold mb-1">أنت شريك طيبت!</h2>
        <p className="text-sm opacity-75">شارك رابطك وابدأ في كسب العمولات</p>
      </div>

      {(affiliate.commissionRate !== undefined || affiliate.referralRate !== undefined) && (
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">💎</span>
          <div>
            <p className="text-sm font-bold text-[var(--primary)]">معدل العمولة: {affiliate.commissionRate ?? affiliate.referralRate ?? 10}%</p>
            <p className="text-xs text-[var(--primary)]">تكسب هذه النسبة من كل اشتراك يأتي عبر رابطك</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard value={affiliate.totalReferred ?? 0} label="إجمالي الإحالات" icon="👥" />
        <StatCard value={affiliate.totalMarriages ?? 0} label="زيجات ناجحة" icon="💍" />
        <button onClick={() => setShowWithdraw(true)} className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 text-center shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-3xl mb-1">💰</div>
          <p className="text-2xl font-bold text-[var(--primary)]">{commission} ر.س</p>
          <p className="text-xs text-[var(--primary)] mt-0.5">رصيد العمولة</p>
          <span className="mt-2 inline-block rounded-lg bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">سحب</span>
        </button>
      </div>
      {showWithdraw && <WithdrawModal commission={commission} onClose={() => setShowWithdraw(false)} />}

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4">
        <h3 className="text-sm font-bold text-[var(--primary)]">كود الإحالة</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-[var(--card)] border border-[var(--border)] px-4 py-3 font-mono text-lg font-bold text-[var(--foreground)] tracking-widest text-center select-all">
            {affiliate.referralCode}
          </div>
          <CopyButton text={affiliate.referralCode} />
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4">
        <h3 className="text-sm font-bold text-[var(--primary)]">رابط الإحالة</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-[var(--card)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)] truncate">
            {referralLink}
          </div>
          <CopyButton text={referralLink} />
        </div>
        <div className="flex gap-3 flex-wrap">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`انضم إلى طيبت — منصة الزواج الإسلامي الذكية 💍\n${referralLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
          >
            <span>📲</span> واتساب
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('انضم إلى طيبت — منصة الزواج الإسلامي الذكية 💍')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#229ED9] text-white hover:opacity-90 transition-opacity"
          >
            <span>✈️</span> تليجرام
          </a>
        </div>
      </div>

      <ReferralHistory />

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
        <h3 className="text-sm font-bold text-[var(--primary)] mb-3">كيف يعمل البرنامج؟</h3>
        <ol className="space-y-2 text-sm text-[var(--foreground)]">
          <li className="flex gap-2"><span className="font-bold text-[var(--primary)]">١.</span> شارك رابط الإحالة مع الأهل والأصدقاء</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--primary)]">٢.</span> عند تسجيلهم عبر رابطك تُحسب لك إحالة</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--primary)]">٣.</span> عند إتمام زواج ناجح تحصل على عمولة إضافية</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--primary)]">٤.</span> يُصرف رصيد العمولة عند الطلب</li>
        </ol>
      </div>
    </div>
  );
}

function ReferralHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['affiliate-referrals'],
    queryFn: () => apiClient.get('/affiliates/referrals').then(r => r.data),
  });
  const referrals: any[] = (data as any)?.data ?? [];

  if (isLoading) return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
      <h3 className="text-sm font-bold text-[var(--primary)] mb-3">سجل الإحالات</h3>
      <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
      <h3 className="text-sm font-bold text-[var(--primary)] mb-3">سجل الإحالات ({referrals.length})</h3>
      {referrals.length === 0 ? (
        <p className="text-center text-xs text-[var(--primary)] py-4">لا توجد إحالات بعد. شارك رابطك لتبدأ!</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {referrals.map((r: any, i: number) => (
            <div key={r.id ?? i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                  {r.referred?.fullName?.charAt(0) ?? r.referred?.firstName?.charAt(0) ?? '؟'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">{r.referred?.fullName ?? r.referred?.firstName ?? 'مستخدم'}</p>
                  <p className="text-[10px] text-[var(--primary)]">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : ''}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                r.status === 'married' ? 'bg-[var(--muted)] text-[var(--primary)]' :
                r.status === 'subscribed' ? 'bg-blue-100 text-blue-700' :
                'bg-[var(--muted)] text-[var(--muted-foreground)]'
              }`}>
                {r.status === 'married' ? '💍 زواج' : r.status === 'subscribed' ? '⭐ مشترك' : '👤 مسجل'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JoinAffiliate() {
  const create = useCreateAffiliate();
  const [customCode, setCustomCode] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleJoin = () => {
    create.mutate(customCode.trim() || undefined);
  };

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}>
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-2xl font-bold text-white mb-2">انضم لبرنامج الإحالة</h2>
        <p className="text-white/80 text-sm leading-relaxed">
          ساعد الآخرين في إيجاد شريك الحياة واكسب عمولات على كل إحالة ناجحة
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 space-y-4 text-right">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <p className="text-2xl mb-1">👥</p>
            <p className="text-sm font-bold text-[var(--primary)]">إحالة مجانية</p>
            <p className="text-xs text-[var(--primary)]">لكل مستخدم جديد</p>
          </div>
          <div className="p-3">
            <p className="text-2xl mb-1">💍</p>
            <p className="text-sm font-bold text-[var(--primary)]">عمولة الزواج</p>
            <p className="text-xs text-[var(--primary)]">عند كل نجاح</p>
          </div>
          <div className="p-3">
            <p className="text-2xl mb-1">💰</p>
            <p className="text-sm font-bold text-[var(--primary)]">سحب سهل</p>
            <p className="text-xs text-[var(--primary)]">في أي وقت</p>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-4 space-y-3">
          {showCustom ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--primary)] block">كود مخصص (اختياري)</label>
              <input
                type="text"
                value={customCode}
                onChange={e => setCustomCode(e.target.value.toUpperCase())}
                placeholder="مثال: AHMED2026"
                maxLength={16}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] bg-[var(--card)]"
              />
              <p className="text-[11px] text-[var(--primary)]">4–16 حرف أو رقم. اتركه فارغاً لتوليد كود تلقائي.</p>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="text-xs text-[var(--primary)] hover:text-[var(--primary)] underline underline-offset-2"
            >
              اختر كود مخصص
            </button>
          )}

          {create.isError && (
            <p className="text-xs text-red-500 text-center">
              {(create.error as any)?.response?.data?.message ?? 'حدث خطأ، حاول مجدداً'}
            </p>
          )}

          <button
            onClick={handleJoin}
            disabled={create.isPending}
            className="w-full rounded-2xl py-3 font-bold text-white text-sm transition-all btn-theme-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {create.isPending ? 'جارٍ التسجيل...' : 'انضم الآن مجاناً ✨'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AffiliatesPage() {
  const { data, isLoading, isError } = useMyAffiliate();
  const affiliate = data?.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--primary)]">برنامج الإحالة</h1>
        <p className="text-sm text-[var(--primary)]">شارك طيبت واكسب عمولات</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-sm text-[var(--primary)]">تعذّر تحميل بيانات برنامج الإحالة</p>
        </div>
      ) : affiliate ? (
        <AffiliateDashboard affiliate={affiliate} />
      ) : (
        <JoinAffiliate />
      )}
    </div>
  );
}
