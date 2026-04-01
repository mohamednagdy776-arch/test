'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) { setError(err.response?.data?.message ?? 'بيانات الدخول غير صحيحة'); }
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
      <button type="submit" disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
        style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
      </button>
      <p className="text-center text-sm text-[#547792]">
        ليس لديك حساب؟{' '}<Link href="/register" className="font-medium text-[#213448] hover:underline">إنشاء حساب</Link>
      </p>
    </form>
  );
};
