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
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(form.email, form.phone, form.password);
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) { setError(err.response?.data?.message ?? 'فشل إنشاء الحساب'); }
    finally { setLoading(false); }
  };

  const fields = [
    { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'you@example.com' },
    { key: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '+201234567890' },
    { key: 'password', label: 'كلمة المرور', type: 'password', placeholder: '8 أحرف على الأقل' },
    { key: 'confirm', label: 'تأكيد كلمة المرور', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[#B05252]/30 bg-[#B05252]/10 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#B05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p className="text-sm font-medium text-[#B05252]">{error}</p>
        </div>
      )}
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <label className="block text-sm font-medium text-[#213448]">{f.label}</label>
          <input type={f.type} required value={(form as any)[f.key]} onChange={set(f.key)} placeholder={f.placeholder}
            className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
        </div>
      ))}
      <button type="submit" disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-semibold text-[#FDFAF5] shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 active:scale-[0.98] mt-2"
        style={{ background: 'linear-gradient(to left, #213448, #547792)' }}>
        {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
      </button>
      <p className="text-center text-sm text-[#547792]">
        لديك حساب بالفعل؟{' '}<Link href="/login" className="font-medium text-[#213448] hover:underline">تسجيل الدخول</Link>
      </p>
    </form>
  );
};
