'use client';
import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const passwordStrength = useMemo(() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'ضعيفة', color: '#EF4444' };
    if (score <= 2) return { level: 2, label: 'متوسطة', color: '#F59E0B' };
    if (score <= 3) return { level: 3, label: 'قوية', color: '#10B981' };
    return { level: 4, label: 'قوية جداً', color: '#059669' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    if (password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }
    const strong = /[a-z]/.test(password) && /[A-Z]/.test(password)
      && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password);
    if (!strong) {
      setError('كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'حدث خطأ، ربما انتهت صلاحية الرابط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-x-hidden bg-[#EAE0CF]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #EAE0CF 50%, #FDFAF5 100%)' }} />
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#94B4C1', opacity: 0.2 }} />
      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#547792', opacity: 0.15 }} />
      <div className="relative w-full max-w-md px-4">
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
            <p className="mt-1.5 text-sm text-[#547792]">أدخل كلمة المرور الجديدة</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-[#B05252]/30 bg-[#B05252]/10 px-4 py-3">
                <svg className="h-5 w-5 shrink-0 text-[#B05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                <p className="text-sm font-medium text-[#B05252]">{error}</p>
              </div>
            )}
            {success ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-[#52B069]/30 bg-[#52B069]/10 px-4 py-3">
                  <svg className="h-5 w-5 shrink-0 text-[#52B069]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="text-sm font-medium text-[#52B069]">تم إعادة تعيين كلمة المرور بنجاح</p>
                </div>
                <button type="button" onClick={() => router.push('/login')}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
                  تسجيل الدخول
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#213448]">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 pr-10 text-base sm:text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#547792] hover:text-[#213448]" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i <= passwordStrength.level ? passwordStrength.color : '#E5E7EB' }} />
                        ))}
                      </div>
                      <p className="mt-1 text-xs" style={{ color: passwordStrength.color }}>{passwordStrength.label}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#213448]">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 pr-10 text-base sm:text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#547792] hover:text-[#213448]" aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                      {showConfirm ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
                  {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
