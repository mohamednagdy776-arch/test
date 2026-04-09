'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (requires2FA) {
        const res = await authApi.verifyLogin2FA(userId, twoFactorCode);
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        router.push('/dashboard');
        return;
      }
      const res = await authApi.login(email, password, rememberMe);
      if (res.data.requiresTwoFactor) {
        setRequires2FA(true);
        setUserId(res.data.userId || '');
        setLoading(false);
        return;
      }
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) { 
      setError(err.response?.data?.message ?? 'بيانات الدخول غير صحيحة'); 
    }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[#B05252]/30 bg-[#B05252]/10 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#B05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p className="text-sm font-medium text-[#B05252]">{error}</p>
        </div>
      )}
      {!requires2FA ? (
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#213448]">البريد الإلكتروني</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
              placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#213448]">كلمة المرور</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
              placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#C8D8DF] text-[#547792] focus:ring-[#547792]" />
              <span className="text-sm text-[#213448]">تذكرني</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-[#547792] hover:underline">نسيت كلمة المرور؟</Link>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#547792]/10 border border-[#547792]/30">
            <p className="text-sm text-[#213448] mb-3">أدخل رمز التحقق من تطبيق المصادقة</p>
            <input type="text" required value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
              placeholder="000000" maxLength={6} />
          </div>
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
        style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
        {loading ? 'جاري الدخول...' : requires2FA ? 'تحقق' : 'تسجيل الدخول'}
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#C8D8DF]"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#FDFAF5] px-2 text-[#BFB9AD]">أو</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/oauth/google?redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard')}`}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] text-sm font-medium text-[#213448] hover:bg-[#F5F2EB] transition-all duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/oauth/github?redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard')}`}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] text-sm font-medium text-[#213448] hover:bg-[#F5F2EB] transition-all duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .315.241.69.794.577 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </button>
      </div>
      <p className="text-center text-sm text-[#547792]">
        ليس لديك حساب؟{' '}<Link href="/register" className="font-medium text-[#213448] hover:underline">إنشاء حساب</Link>
      </p>
    </form>
  );
};
