'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

interface FormData {
  email: string;
  phone: string;
  password: string;
  confirm: string;
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  gender: string;
}

export const RegisterForm = () => {
  const [form, setForm] = useState<FormData>({
    email: '', phone: '', password: '', confirm: '',
    firstName: '', lastName: '', username: '',
    dateOfBirth: '', gender: 'male'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordStrength = useMemo(() => {
    const pwd = form.password;
    if (!pwd) return { level: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: 'ضعيفة', color: '#EF4444' };
    if (score <= 2) return { level: 2, label: 'متوسطة', color: '#F59E0B' };
    if (score <= 3) return { level: 3, label: 'قوية', color: '#10B981' };
    return { level: 4, label: 'قوية جداً', color: '#059669' };
  }, [form.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!agreedToTerms) { setError('يرجى الموافقة على الشروط والأحكام'); return; }
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
        <div className="flex items-center gap-3 rounded-2xl border border-[#EF4444]/30 bg-[#FEF2F2] px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p className="text-sm font-medium text-[#EF4444]">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#374151]">الاسم الأول</label>
          <input type="text" required value={form.firstName} onChange={set('firstName')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#374151]">اسم العائلة</label>
          <input type="text" required value={form.lastName} onChange={set('lastName')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#374151]">اسم المستخدم</label>
        <input type="text" value={form.username} onChange={set('username')}
          className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#374151]">البريد الإلكتروني</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.96V6.75"/></svg>
          </div>
          <input type="email" required value={form.email} onChange={set('email')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#374151]">رقم الهاتف</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.151l-4.423-1.106c-.44-.11-.902.275-.902.814v1.26c0 .624.564 1.001 1.158.714l2.756 1.382a20.087 20.087 0 01-4.12 4.121l-2.756-1.382c-.594-.291-1.158.09-1.158.714v1.26c0 .539.451.924.902.814l4.423-1.106c.5-.185.852-.635.852-1.151V18a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6.75z"/></svg>
          </div>
          <input type="tel" required value={form.phone} onChange={set('phone')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
            placeholder="+966 50 000 0000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#374151]">تاريخ ��لميلاد</label>
          <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#374151]">الجنس</label>
          <select value={form.gender} onChange={set('gender')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200">
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
            <option value="custom">مخصص</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#374151]">كلمة المرور</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
          </div>
          <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={set('password')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 pr-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
            placeholder="8+ أحرف, حرف كبير, رقم, رمز" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.997 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7a178.058 178.058 0 01-9.95 7.521c-.819 0-1.602-.252-2.318-.637m-5.491 2.102a3 3 0 01-3.764 0M19.513 14.121A10.45 10.45 0 0112 19.5c-4.756 0-8.997-3.162-10.065-7.498a10.461 10.461 0 013.676-5.715"/></svg>
            )}
          </button>
        </div>
        {form.password && (
          <div className="space-y-2 mt-2">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className="h-1.5 flex-1 rounded-full transition-all duration-300" 
                  style={{ background: level <= passwordStrength.level ? passwordStrength.color : '#E5E7EB' }} />
              ))}
            </div>
            <p className="text-xs font-medium" style={{ color: passwordStrength.color }}>{passwordStrength.label}</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#374151]">تأكيد كلمة المرور</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
          </div>
          <input type={showPassword ? 'text' : 'password'} required value={form.confirm} onChange={set('confirm')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 pr-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
            placeholder="••••••••" />
        </div>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded-lg border-[#D1D5DB] text-[#10B981] focus:ring-[#10B981] focus:ring-offset-0" />
        <span className="text-sm text-[#6B7280]">
          أوافق على{' '}
          <Link href="/terms" className="text-[#10B981] hover:text-[#059669] font-medium transition-colors">الشروط والأحكام</Link>
          {' '}و{' '}
          <Link href="/privacy" className="text-[#10B981] hover:text-[#059669] font-medium transition-colors">سياسة الخصوصية</Link>
        </span>
      </label>
      <button type="submit" disabled={loading}
        className="w-full h-12 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 active:scale-[0.98] mt-2"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
        {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
      </button>
      <p className="text-center text-sm text-[#6B7280]">
        لديك حساب بالفعل؟{' '}<Link href="/login" className="font-semibold text-[#10B981] hover:text-[#059669] transition-colors">تسجيل الدخول</Link>
      </p>
    </form>
  );
};