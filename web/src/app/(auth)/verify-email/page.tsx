'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('resend');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      setStatus('success');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid or expired token');
      setStatus('error');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.resendVerification(email);
      setStatus('success');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#EAE0CF]">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #EAE0CF 50%, #FDFAF5 100%)' }} />
        <div className="relative w-full max-w-md px-4">
          <div className="rounded-2xl bg-[#FDFAF5] shadow-elevated p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
              <svg className="h-7 w-7 animate-spin text-[#FDFAF5]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-[#547792]">جاري التحقق...</p>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#EAE0CF]">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #EAE0CF 50%, #FDFAF5 100%)' }} />
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#94B4C1', opacity: 0.2 }} />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#547792', opacity: 0.15 }} />
        <div className="relative w-full max-w-md px-4 animate-scale-in">
          <div className="rounded-2xl bg-[#FDFAF5] shadow-elevated p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-[#FDFAF5] font-bold text-2xl shadow-md" style={{ background: 'linear-gradient(135deg, #52B069, #4A9E5C)' }}>
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-[#213448]">تم التحقق من البريد الإلكتروني</h1>
              <p className="mt-1.5 text-sm text-[#547792]">تم تفعيل حسابك بنجاح</p>
            </div>
            <button onClick={() => router.push('/login')}
              className="w-full h-11 mt-6 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
              تسجيل الدخول
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#EAE0CF]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #EAE0CF 50%, #FDFAF5 100%)' }} />
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#94B4C1', opacity: 0.2 }} />
      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#547792', opacity: 0.15 }} />
      <div className="relative w-full max-w-md px-4 animate-scale-in">
        <Link href="/login" className="flex items-center gap-2 text-sm text-[#547792] hover:text-[#213448] transition-colors mb-6">
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          العودة لتسجيل الدخول
        </Link>
        <div className="rounded-2xl bg-[#FDFAF5] shadow-elevated p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-[#FDFAF5] font-bold text-2xl shadow-md" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#213448]">تحقق من البريد الإلكتروني</h1>
            <p className="mt-1.5 text-sm text-[#547792]">أدخل بريدك الإلكتروني لإعادة إرسال رابط التفعيل</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleResend(); }} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-[#B05252]/30 bg-[#B05252]/10 px-4 py-3">
                <svg className="h-5 w-5 shrink-0 text-[#B05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                <p className="text-sm font-medium text-[#B05252]">{error}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#213448]">البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
                placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
              {loading ? 'جاري الإرسال...' : 'إرسال رابط التفعيل'}
            </button>
            <p className="text-center text-sm text-[#547792]">
              هل لديك حساب؟{' '}<Link href="/login" className="font-medium text-[#213448] hover:underline">تسجيل الدخول</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#EAE0CF]">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}