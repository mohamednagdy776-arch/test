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
    // Validate the email format client-side (#731) — an invalid address used to
    // pass the non-empty-only check and only fail server-side.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setError('صيغة البريد الإلكتروني غير صحيحة');
      return;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> العودة للإعدادات
        </Link>

        {/* Header */}
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xl shadow-lg shadow-black/10">
              📧
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--primary)]">تغيير البريد الإلكتروني</h1>
              <p className="text-xs text-[var(--primary)]">عملية آمنة تتطلب التحقق من هويتك</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 pt-1">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-[var(--muted)] text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                  {s.n}
                </span>
                <p className="text-xs text-[var(--foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} noValidate className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-lg shadow-black/5">
          {done && (
            <div className="flex items-start gap-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--primary)]">
              <span className="shrink-0 mt-0.5">✓</span>
              <span>{done}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-3 text-sm text-[var(--destructive)]">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {currentEmail && (
            <div className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)]">
              <span className="font-semibold">البريد الحالي: </span>
              <span className="font-mono">{currentEmail}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">البريد الإلكتروني الجديد</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-base sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">كلمة المرور الحالية</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-base sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newEmail || !currentPassword}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            style={{ background: 'linear-gradient(to left, var(--primary), var(--secondary))' }}
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط التأكيد'}
          </button>
        </form>

        {/* Security note */}
        <div className="rounded-2xl bg-[var(--muted)] border border-[var(--border)] p-4">
          <p className="text-xs font-bold text-[var(--foreground)] mb-1">🔐 ملاحظة أمنية</p>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            لن يتغير بريدك الإلكتروني حتى تضغط على رابط التأكيد المرسل إلى البريد الجديد. إذا لم تطلب هذا التغيير، تجاهل الرابط.
          </p>
        </div>
      </div>
    </div>
  );
}
