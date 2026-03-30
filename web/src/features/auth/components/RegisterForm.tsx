'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

export const RegisterForm = () => {
  const [form, setForm] = useState({ email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(form.email, form.phone, form.password);
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'you@example.com' },
    { key: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '+201234567890' },
    { key: 'password', label: 'كلمة المرور', type: 'password', placeholder: '8 أحرف على الأقل' },
    { key: 'confirm', label: 'تأكيد كلمة المرور', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
          <input type={f.type} required value={(form as any)[f.key]} onChange={set(f.key)} placeholder={f.placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      ))}
      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
      </button>
      <p className="text-center text-sm text-gray-500">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">تسجيل الدخول</Link>
      </p>
    </form>
  );
};
