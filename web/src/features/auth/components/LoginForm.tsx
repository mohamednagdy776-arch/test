'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="flex items-center gap-3 rounded-2xl border border-[#EF4444]/30 bg-[#FEF2F2] px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p className="text-sm font-medium text-[#EF4444]">{error}</p>
        </div>
      )}
      {!requires2FA ? (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.96V6.75"/></svg>
              </div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
                placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">كلمة المرور</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
              </div>
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 pr-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.997 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7a178.058 178.058 0 01-9.95 7.521c-.819 0-1.602-.252-2.318-.637m-5.491 2.102a3 3 0 01-3.764 0M19.513 14.121A10.45 10.45 0 0112 19.5c-4.756 0-8.997-3.162-10.065-7.498a10.461 10.461 0 013.676-5.715"/></svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded-lg border-[#D1D5DB] text-[#10B981] focus:ring-[#10B981] focus:ring-offset-0" />
              <span className="text-sm text-[#4B5563]">تذكرني</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-[#059669] hover:text-[#047857] font-medium transition-colors">نسيت كلمة المرور؟</Link>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#10B981]/30">
            <p className="text-sm text-[#374151] mb-3">أدخل رمز التحقق من تطبيق المصادقة</p>
            <input type="text" required value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)}
              className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
              placeholder="000000" maxLength={6} />
          </div>
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full h-12 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
        {loading ? 'جاري تسجيل الدخول...' : requires2FA ? 'تحقق' : 'تسجيل الدخول'}
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E5E7EB]"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#FFFBEB] px-3 text-[#9CA3AF]">أو</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/oauth/google?redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard')}`}
          className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button type="button" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/oauth/apple?redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard')}`}
          className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.02.41-2.24 1.05-3.11z"/></svg>
          Apple
        </button>
      </div>
      <p className="text-center text-sm text-[#6B7280]">
        ليس لديك حساب؟{' '}<Link href="/register" className="font-semibold text-[#10B981] hover:text-[#059669] transition-colors">إنشاء حساب</Link>
      </p>
    </form>
  );
};