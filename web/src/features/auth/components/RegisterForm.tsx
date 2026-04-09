'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

export const RegisterForm = () => {
  const [form, setForm] = useState({
    email: '', phone: '', password: '', confirm: '',
    firstName: '', lastName: '', username: '',
    dateOfBirth: '', gender: 'male'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({
        email: form.email,
        phone: form.phone,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('refresh_token', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) { 
      setError(err.response?.data?.message ?? 'فشل إنشاء الحساب'); 
    }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[#B05252]/30 bg-[#B05252]/10 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#B05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p className="text-sm font-medium text-[#B05252]">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#213448]">الاسم الأول</label>
          <input type="text" required value={form.firstName} onChange={set('firstName')}
            className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#213448]">اسم العائلة</label>
          <input type="text" required value={form.lastName} onChange={set('lastName')}
            className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#213448]">اسم المستخدم</label>
        <input type="text" value={form.username} onChange={set('username')}
          className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#213448]">البريد الإلكتروني</label>
        <input type="email" required value={form.email} onChange={set('email')}
          className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#213448]">رقم الهاتف</label>
        <input type="tel" required value={form.phone} onChange={set('phone')}
          className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#213448]">تاريخ الميلاد</label>
          <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
            className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#213448]">الجنس</label>
          <select value={form.gender} onChange={set('gender')}
            className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200">
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
            <option value="custom">مخصص</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#213448]">كلمة المرور</label>
        <input type="password" required value={form.password} onChange={set('password')}
          className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
          placeholder="8+ أحرف, حرف كبير, رقم, رمز" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#213448]">تأكيد كلمة المرور</label>
        <input type="password" required value={form.confirm} onChange={set('confirm')}
          className="flex h-11 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-4 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200"
          placeholder="••••••••" />
      </div>
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
