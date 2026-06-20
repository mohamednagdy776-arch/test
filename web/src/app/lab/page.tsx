'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function LabLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/lab-portal/auth/login', { email, password });
      const { token, labId, labName, role } = res.data;
      sessionStorage.setItem('lab_token', token);
      sessionStorage.setItem('lab_id', labId);
      sessionStorage.setItem('lab_name', labName ?? '');
      sessionStorage.setItem('lab_role', role ?? '');
      router.push('/lab/scan');
    } catch {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D4E8EE 0%, #EAF4F0 50%, #FDFAF5 100%)' }} />
      <div className="absolute top-20 right-20 h-80 w-80 rounded-full blur-3xl" style={{ background: '#94B4C1', opacity: 0.25 }} />
      <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#10B981', opacity: 0.12 }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full blur-3xl" style={{ background: '#547792', opacity: 0.08 }} />

      <div className="relative w-full max-w-md px-4 py-8">
        {/* Card */}
        <div className="rounded-3xl shadow-2xl p-8" style={{ background: 'rgba(253,250,245,0.95)', backdropFilter: 'blur(12px)' }}>

          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 00.45-1.136v-.813a2.25 2.25 0 00-.45-1.136L19.05 11H4.95l-.75 1.045A2.25 2.25 0 003.75 13.5v.813c0 .404.12.8.345 1.136l.404.566A2.25 2.25 0 006.362 17h11.276a2.25 2.25 0 001.863-.985l.299-.415zM12 17.25v3.75" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937]">بوابة المختبر</h1>
            <p className="mt-2 text-sm text-[#6B7280]">سجّل دخولك للتحقق من أكواد المرضى</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 mb-5">
              <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#374151]">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.96V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="lab@example.com"
                  className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white pr-12 pl-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#547792]/30 focus:border-[#547792] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#374151]">كلمة المرور</label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white pr-12 pl-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#547792]/30 focus:border-[#547792] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.997 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7a10.159 10.159 0 01-4.021 5.163m-4.021-5.163A3 3 0 1112 15a3 3 0 01-4.021-2.678z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#9CA3AF]">
            هذه البوابة مخصصة لموظفي المختبرات المعتمدة فقط
          </p>
        </div>
      </div>
    </main>
  );
}
