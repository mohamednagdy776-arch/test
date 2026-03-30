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
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="you@example.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">كلمة المرور</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
      </button>
      <p className="text-center text-sm text-gray-500">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">إنشاء حساب</Link>
      </p>
    </form>
  );
};
