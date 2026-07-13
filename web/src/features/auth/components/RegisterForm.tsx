'use client';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../api';

function PremiumUpsell({ onContinue, onUpgrade }: { onContinue: () => void; onUpgrade: () => void }) {
  return (
    <div className="text-center space-y-5">
      <div className="text-5xl">🎉</div>
      <h2 className="text-xl font-bold text-[#1F2937]">مرحباً بك في طيبت!</h2>
      <p className="text-sm text-[#6B7280]">حسابك جاهز. رحلتك نحو شريك الحياة تبدأ الآن.</p>
      <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-5 space-y-3 text-right">
        <p className="text-sm font-bold text-[#059669]">✨ مع الخطة المتميزة:</p>
        <ul className="space-y-1.5 text-sm text-[#065F46]">
          <li>✓ توافقات غير محدودة يومياً</li>
          <li>✓ تحليلات توافق معمّقة</li>
          <li>✓ أولوية في نتائج البحث</li>
          <li>✓ شارة مميز على ملفك</li>
        </ul>
        <p className="text-xs text-[#10B981] font-semibold">99 ر.س / شهر فقط</p>
      </div>
      <div className="space-y-2">
        <button onClick={onUpgrade} className="w-full rounded-2xl py-3 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
          ترقية للمتميز الآن
        </button>
        <button onClick={onContinue} className="w-full text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors py-1">
          ابدأ مجاناً بدون ترقية
        </button>
      </div>
    </div>
  );
}

// Translate / format backend errors so the user always sees a clear reason.
// NestJS validation errors arrive as `message: string[]`; other errors as a string.
const AR_MESSAGES: Record<string, string> = {
  'Email already registered': 'البريد الإلكتروني مسجّل بالفعل',
  'Username already taken': 'اسم المستخدم مُستخدم بالفعل',
  'Resource already exists': 'هذا الحساب موجود بالفعل (بريد أو هاتف مكرر)',
  'email must be an email': 'صيغة البريد الإلكتروني غير صحيحة',
  'password must be longer than or equal to 8 characters': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  'Password must be at least 8 characters with uppercase, lowercase, number, and special character':
    'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع حرف كبير وصغير ورقم ورمز خاص',
  'phone must be a valid phone number': 'رقم الهاتف غير صحيح',
  'Referenced record does not exist': 'تعذّر إكمال الطلب، تحقّق من البيانات',
  'You must be at least 18 years old to register': 'يجب أن يكون عمرك 18 عاماً على الأقل للتسجيل',
  'username may only contain letters, numbers, and . _ -':
    'اسم المستخدم يمكن أن يحتوي على أحرف وأرقام والرموز . _ - فقط (بدون مسافات)',
  'first name contains invalid characters': 'الاسم الأول يحتوي على رموز غير مسموحة',
  'last name contains invalid characters': 'اسم العائلة يحتوي على رموز غير مسموحة',
};

// Arabic (+ Latin) letters, spaces, hyphen, apostrophe — for names.
const NAME_REGEX = /^[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿a-zA-Z\s'-]+$/;
// Arabic + Latin + digits + . _ - , no spaces — for username.
const USERNAME_REGEX = /^[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿a-zA-Z0-9._-]+$/;

// The phone field had a generic handset icon and a placeholder implying a
// Saudi number, but no way to actually pick a country/dialing code -- users
// had to know to type the full "+<code>" prefix themselves (#267).
const PHONE_COUNTRIES = [
  { code: '+966', label: 'السعودية' },
  { code: '+20', label: 'مصر' },
  { code: '+971', label: 'الإمارات' },
  { code: '+965', label: 'الكويت' },
  { code: '+974', label: 'قطر' },
  { code: '+973', label: 'البحرين' },
  { code: '+968', label: 'عمان' },
  { code: '+962', label: 'الأردن' },
  { code: '+961', label: 'لبنان' },
  { code: '+963', label: 'سوريا' },
  { code: '+964', label: 'العراق' },
  { code: '+970', label: 'فلسطين' },
  { code: '+218', label: 'ليبيا' },
  { code: '+216', label: 'تونس' },
  { code: '+213', label: 'الجزائر' },
  { code: '+212', label: 'المغرب' },
  { code: '+249', label: 'السودان' },
  { code: '+1', label: 'الولايات المتحدة / كندا' },
  { code: '+44', label: 'المملكة المتحدة' },
];

// Age (in whole years) from a yyyy-mm-dd date string.
function ageFrom(dateStr: string): number {
  const dob = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}
const translate = (m: string) => AR_MESSAGES[m] ?? m;

function formatAuthError(err: any): string {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.map(translate).join('، ');
  if (typeof m === 'string' && m.trim()) return translate(m);
  if (err?.response?.status === 409) return 'هذا الحساب موجود بالفعل';
  if (err?.code === 'ERR_NETWORK' || !err?.response) return 'تعذّر الاتصال بالخادم، تحقّق من اتصالك بالإنترنت';
  return 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
}

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
    dateOfBirth: '', gender: ''
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('+966');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const router = useRouter();
  // Capture ?ref=<code> from a shared affiliate link so a successful
  // registration can be credited to the referrer (#107).
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get('ref') || undefined;

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Latest date that still makes the user 18 today (used as the date input max, #55).
  const maxBirthDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

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
    // Validate in JS (the form is noValidate to suppress the browser's English
    // validation bubbles on this Arabic/RTL form, #735), with Arabic messages.
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('يرجى إدخال الاسم الأول واسم العائلة'); return; }
    if (!NAME_REGEX.test(form.firstName.trim())) { setError('الاسم الأول يحتوي على رموز غير مسموحة'); return; }
    if (!NAME_REGEX.test(form.lastName.trim())) { setError('اسم العائلة يحتوي على رموز غير مسموحة'); return; }
    if (form.username.trim() && (form.username.trim().length < 3 || form.username.trim().length > 30 || !USERNAME_REGEX.test(form.username.trim()))) {
      setError('اسم المستخدم يجب أن يكون 3-30 حرفاً ويحتوي على أحرف وأرقام والرموز . _ - فقط (بدون مسافات)'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('صيغة البريد الإلكتروني غير صحيحة'); return; }
    // dateOfBirth is required (#124) — the backend now rejects registration
    // without it too, but block the submit locally with a clear message.
    if (!form.dateOfBirth) { setError('يرجى إدخال تاريخ الميلاد'); return; }
    if (ageFrom(form.dateOfBirth) < 18) { setError('يجب أن يكون عمرك 18 عاماً على الأقل للتسجيل'); return; }
    const fullPhone = phoneCountryCode + form.phone.trim().replace(/^0+/, '');
    if (!/^\+?[1-9]\d{6,14}$/.test(fullPhone)) { setError('رقم الهاتف غير صحيح'); return; }
    if (!form.gender) { setError('يرجى اختيار الجنس'); return; }
    if (!agreedToTerms) { setError('يرجى الموافقة على الشروط والأحكام'); return; }
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    // Match the backend complexity rule so the user knows immediately
    const strong = /[a-z]/.test(form.password) && /[A-Z]/.test(form.password)
      && /\d/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password);
    if (!strong) { setError('كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص'); return; }
    setLoading(true);
    try {
      // Only send optional fields when they have a value. The backend marks
      // username/gender @IsOptional(), but class-validator only skips
      // null/undefined — an empty string still runs validators and 400s.
      // dateOfBirth is required (#124) and always set by this point (checked above).
      const payload: {
        email: string; phone: string; password: string;
        firstName?: string; lastName?: string; username?: string;
        dateOfBirth: string; gender?: string; referralCode?: string;
      } = {
        email: form.email.trim(),
        phone: fullPhone,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
      };
      if (form.username.trim()) payload.username = form.username.trim();
      if (form.gender) payload.gender = form.gender;
      if (referralCode) payload.referralCode = referralCode;
      // Tokens are set as HttpOnly cookies by the backend — nothing to store
      // client-side (avoids XSS token theft from localStorage).
      await authApi.register(payload);
      setShowUpsell(true);
    } catch (err: any) {
      setError(formatAuthError(err));
    }
    finally { setLoading(false); }
  };

  if (showUpsell) {
    return (
      <PremiumUpsell
        onContinue={() => router.push('/dashboard')}
        onUpgrade={() => router.push('/upgrade')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
          {/* type="email" inputs get a browser-default LTR text alignment
              regardless of the surrounding RTL context, unlike the plain
              type="text" fields around it -- explicit text-right matches
              them (#220). */}
          <input type="email" required value={form.email} onChange={set('email')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-12 text-sm text-right text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#374151]">رقم الهاتف</label>
        <div className="flex gap-2">
          <select
            value={phoneCountryCode}
            onChange={(e) => setPhoneCountryCode(e.target.value)}
            className="h-12 rounded-2xl border border-[#D1D5DB] bg-white px-3 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} {c.label}</option>
            ))}
          </select>
          <input type="tel" required value={form.phone} onChange={set('phone')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200"
            placeholder="50 000 0000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#374151]">تاريخ الميلاد</label>
          <input type="date" required value={form.dateOfBirth} onChange={set('dateOfBirth')} max={maxBirthDate}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#374151]">الجنس</label>
          <select required value={form.gender} onChange={set('gender')}
            className="flex h-12 w-full rounded-2xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-200">
            <option value="" disabled>اختر...</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
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