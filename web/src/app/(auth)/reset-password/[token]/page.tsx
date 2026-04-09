'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'enter' | 'reset'>('enter');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setStep('reset');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('الرجاء إدخال الرمز');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

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
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#213448]">إعادة تعيين كلمة المرور</h1>
            <p className="mt-1.5 text-sm text-[#547792]">
              {step === 'enter' ? 'أدخل رمز الاستعادة من البريد الإلكتروني' : 'أدخل كلمة المرور الجديدة'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-[#B05252]/30 bg-[#B05252]/10 px-4 py-3">
                <svg className="h-5 w-5 shrink-0 text-[#B05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                <p className="text-sm font-medium text-[#B05252]">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-[#52B069]/30 bg-[#52B069]/10 px-4 py-3">
                <svg className="h-5 w-5 shrink-0 text-[#52B069]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-sm font-medium text-[#52B069]">تم إعادة تعيين كلمة المرور بنجاح</p>
              </div>
            )}
            {!success && (
              <>
                {step === 'enter' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#213448]">رمز الاستعادة</label>
                    <input type="text" required value={token} onChange={(e) => setToken(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
                      placeholder="أدخل الرمز من البريد الإلكتروني" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#213448]">
                    {step === 'enter' ? 'أو أدخل الرمز من الرابط' : 'كلمة المرور الجديدة'}
                  </label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
                    placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#213448]">تأكيد كلمة المرور</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
                    placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
                  {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                </button>
              </>
            )}
            {success && (
              <button type="button" onClick={() => router.push('/login')}
                className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
                تسجيل الدخول
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#EAE0CF]">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}