'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';
import { apiClient } from '@/lib/api-client';

const STEPS = [
  { n: '١', label: 'أدخل البريد الجديد وكلمة المرور' },
  { n: '٢', label: 'نرسل رابط التأكيد إلى البريد الجديد' },
  { n: '٣', label: 'اضغط الرابط لتأكيد التغيير' },
];

export default function ChangeEmailPage() {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
    staleTime: 300_000,
  });
  const currentEmail: string = meData?.data?.email ?? meData?.email ?? '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDone('');
    setLoading(true);
    try {
      const r: any = await authApi.requestEmailChange(newEmail.trim(), currentPassword);
      setDone(r?.message || 'تم إرسال رابط التأكيد إلى البريد الإلكتروني الجديد.');
      setNewEmail('');
      setCurrentPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'تعذّر تغيير البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> العودة للإعدادات
        </Link>

        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
              📧
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#059669]">تغيير البريد الإلكتروني</h1>
              <p className="text-xs text-[#10B981]">عملية آمنة تتطلب التحقق من هويتك</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 pt-1">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-emerald-100 text-[#059669] text-xs font-bold flex items-center justify-center">
                  {s.n}
                </span>
                <p className="text-xs text-[#065F46]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="rounded-2xl bg-white/80 border border-emerald-100 p-5 space-y-4 shadow-lg shadow-emerald-500/5">
          {done && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              <span className="shrink-0 mt-0.5">✓</span>
              <span>{done}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {currentEmail && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-[#065F46]">
              <span className="font-semibold">البريد الحالي: </span>
              <span className="font-mono">{currentEmail}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[#065F46] mb-1.5">البريد الإلكتروني الجديد</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-emerald-200 bg-[#FFFBEB] px-4 py-2.5 text-sm text-[#065F46] placeholder-emerald-400/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#065F46] mb-1.5">كلمة المرور الحالية</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-emerald-200 bg-[#FFFBEB] px-4 py-2.5 text-sm text-[#065F46] placeholder-emerald-400/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newEmail || !currentPassword}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط التأكيد'}
          </button>
        </form>

        {/* Security note */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">🔐 ملاحظة أمنية</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            لن يتغير بريدك الإلكتروني حتى تضغط على رابط التأكيد المرسل إلى البريد الجديد. إذا لم تطلب هذا التغيير، تجاهل الرابط.
          </p>
        </div>
      </div>
    </div>
  );
}
