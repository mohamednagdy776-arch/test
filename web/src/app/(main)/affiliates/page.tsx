'use client';

import { useState } from 'react';
import { useMyAffiliate, useCreateAffiliate } from '@/features/affiliates/hooks';
import { apiClient } from '@/lib/api-client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tayyibt.com';

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white border border-[#DCFCE7]/60 p-5 text-center shadow-sm">
      <div className="text-3xl mb-1">{icon}</div>
      <p className="text-2xl font-bold text-[#059669]">{value}</p>
      <p className="text-xs text-[#10B981] mt-0.5">{label}</p>
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
      className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all bg-[#10B981] text-white hover:bg-[#059669] active:scale-95"
    >
      {copied ? '✓ تم النسخ' : 'نسخ'}
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
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#065F46]">طلب سحب العمولة</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {done ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-bold text-[#059669]">تم إرسال طلب السحب</p>
            <p className="text-xs text-[#10B981] mt-1">سيتم مراجعة طلبك خلال 3-5 أيام عمل</p>
            <button onClick={onClose} className="mt-4 rounded-xl bg-[#10B981] px-5 py-2 text-sm font-semibold text-white">حسناً</button>
          </div>
        ) : balance < MIN_PAYOUT ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm text-[#065F46] font-medium">الحد الأدنى للسحب {MIN_PAYOUT} ر.س</p>
            <p className="text-xs text-[#10B981] mt-1">رصيدك الحالي: <span className="font-bold">{commission} ر.س</span></p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#10B981]">المبلغ المتاح للسحب: <span className="font-bold text-[#065F46]">{commission} ر.س</span></p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#059669] block mb-1">رقم الآيبان (IBAN)</label>
                <input value={iban} onChange={e => setIban(e.target.value)} placeholder="SA..." className="w-full rounded-xl border border-[#DCFCE7] px-4 py-2.5 text-sm font-mono text-[#065F46] focus:outline-none focus:border-[#10B981] bg-white" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#059669] block mb-1">اسم صاحب الحساب</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم كما في البنك" className="w-full rounded-xl border border-[#DCFCE7] px-4 py-2.5 text-sm text-[#065F46] focus:outline-none focus:border-[#10B981] bg-white" />
              </div>
              <button onClick={handleRequest} disabled={!iban.trim() || !name.trim() || sending} className="w-full rounded-2xl py-3 font-bold text-white text-sm bg-gradient-to-l from-[#10B981] to-[#059669] disabled:opacity-60 disabled:cursor-not-allowed">
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
      <div className="rounded-3xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
        <p className="text-sm font-semibold opacity-80 mb-1">برنامج الإحالة</p>
        <h2 className="text-2xl font-bold mb-1">أنت شريك طيبت!</h2>
        <p className="text-sm opacity-75">شارك رابطك وابدأ في كسب العمولات</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard value={affiliate.totalReferred ?? 0} label="إجمالي الإحالات" icon="👥" />
        <StatCard value={affiliate.totalMarriages ?? 0} label="زيجات ناجحة" icon="💍" />
        <button onClick={() => setShowWithdraw(true)} className="rounded-2xl bg-white border border-[#DCFCE7]/60 p-5 text-center shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-3xl mb-1">💰</div>
          <p className="text-2xl font-bold text-[#059669]">{commission} ر.س</p>
          <p className="text-xs text-[#10B981] mt-0.5">رصيد العمولة</p>
          <span className="mt-2 inline-block rounded-lg bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-semibold text-[#059669]">سحب</span>
        </button>
      </div>
      {showWithdraw && <WithdrawModal commission={commission} onClose={() => setShowWithdraw(false)} />}

      <div className="rounded-2xl bg-[#FFFBEB] border border-[#DCFCE7]/60 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#059669]">كود الإحالة</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-white border border-[#DCFCE7] px-4 py-3 font-mono text-lg font-bold text-[#065F46] tracking-widest text-center select-all">
            {affiliate.referralCode}
          </div>
          <CopyButton text={affiliate.referralCode} />
        </div>
      </div>

      <div className="rounded-2xl bg-[#FFFBEB] border border-[#DCFCE7]/60 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#059669]">رابط الإحالة</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-white border border-[#DCFCE7] px-4 py-3 text-sm text-[#065F46] truncate">
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

      <div className="rounded-2xl bg-[#FFFBEB] border border-[#DCFCE7]/60 p-5">
        <h3 className="text-sm font-bold text-[#059669] mb-3">كيف يعمل البرنامج؟</h3>
        <ol className="space-y-2 text-sm text-[#065F46]">
          <li className="flex gap-2"><span className="font-bold text-[#10B981]">١.</span> شارك رابط الإحالة مع الأهل والأصدقاء</li>
          <li className="flex gap-2"><span className="font-bold text-[#10B981]">٢.</span> عند تسجيلهم عبر رابطك تُحسب لك إحالة</li>
          <li className="flex gap-2"><span className="font-bold text-[#10B981]">٣.</span> عند إتمام زواج ناجح تحصل على عمولة إضافية</li>
          <li className="flex gap-2"><span className="font-bold text-[#10B981]">٤.</span> يُصرف رصيد العمولة عند الطلب</li>
        </ol>
      </div>
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
      <div className="rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-2xl font-bold text-white mb-2">انضم لبرنامج الإحالة</h2>
        <p className="text-white/80 text-sm leading-relaxed">
          ساعد الآخرين في إيجاد شريك الحياة واكسب عمولات على كل إحالة ناجحة
        </p>
      </div>

      <div className="rounded-2xl bg-[#FFFBEB] border border-[#DCFCE7]/60 p-6 space-y-4 text-right">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <p className="text-2xl mb-1">👥</p>
            <p className="text-sm font-bold text-[#059669]">إحالة مجانية</p>
            <p className="text-xs text-[#10B981]">لكل مستخدم جديد</p>
          </div>
          <div className="p-3">
            <p className="text-2xl mb-1">💍</p>
            <p className="text-sm font-bold text-[#059669]">عمولة الزواج</p>
            <p className="text-xs text-[#10B981]">عند كل نجاح</p>
          </div>
          <div className="p-3">
            <p className="text-2xl mb-1">💰</p>
            <p className="text-sm font-bold text-[#059669]">سحب سهل</p>
            <p className="text-xs text-[#10B981]">في أي وقت</p>
          </div>
        </div>

        <div className="border-t border-[#DCFCE7]/60 pt-4 space-y-3">
          {showCustom ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#059669] block">كود مخصص (اختياري)</label>
              <input
                type="text"
                value={customCode}
                onChange={e => setCustomCode(e.target.value.toUpperCase())}
                placeholder="مثال: AHMED2026"
                maxLength={16}
                className="w-full rounded-xl border border-[#DCFCE7] px-4 py-2.5 text-sm font-mono text-[#065F46] focus:outline-none focus:border-[#10B981] bg-white"
              />
              <p className="text-[11px] text-[#10B981]">4–16 حرف أو رقم. اتركه فارغاً لتوليد كود تلقائي.</p>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="text-xs text-[#10B981] hover:text-[#059669] underline underline-offset-2"
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
            className="w-full rounded-2xl py-3 font-bold text-white text-sm transition-all bg-gradient-to-l from-[#10B981] to-[#059669] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <h1 className="text-xl font-bold text-[#059669]">برنامج الإحالة</h1>
        <p className="text-sm text-[#10B981]">شارك طيبت واكسب عمولات</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-[#DCFCE7]/30 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-10 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-sm text-[#10B981]">تعذّر تحميل بيانات برنامج الإحالة</p>
        </div>
      ) : affiliate ? (
        <AffiliateDashboard affiliate={affiliate} />
      ) : (
        <JoinAffiliate />
      )}
    </div>
  );
}
