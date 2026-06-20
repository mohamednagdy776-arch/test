'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function LabScanPage() {
  const router = useRouter();
  const [labName, setLabName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem('lab_token');
    if (!token) { router.replace('/lab'); return; }
    setLabName(sessionStorage.getItem('lab_name') ?? 'المختبر');
  }, [router]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('lab_token');
    if (!token) { router.replace('/lab'); return; }

    setLoading(true);
    setResult(null);
    try {
      await apiClient.post(
        '/lab-portal/scan',
        { code: code.trim().toUpperCase() },
        { headers: { 'x-lab-token': token } },
      );
      setResult('success');
      setMessage('تم التحقق بنجاح وإضافة شارة السلامة الصحية للمستخدم');
      setScanCount((n) => n + 1);
      setCode('');
    } catch (err: any) {
      setResult('error');
      const msg = err?.response?.data?.message;
      setMessage(
        msg === 'Invalid, expired, or already used referral code'
          ? 'الكود غير صالح أو منتهي الصلاحية أو تم استخدامه مسبقاً'
          : msg === 'Invalid or expired lab token'
          ? 'انتهت جلسة المختبر، يرجى تسجيل الدخول مجدداً'
          : 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
      );
      if (msg === 'Invalid or expired lab token') {
        sessionStorage.clear();
        setTimeout(() => router.replace('/lab'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.replace('/lab');
  };

  return (
    <main className="relative min-h-screen overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #F0F9F4 0%, #E8F4EE 40%, #FDFAF5 100%)' }} />
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full blur-3xl" style={{ background: '#10B981', opacity: 0.1 }} />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl" style={{ background: '#547792', opacity: 0.08 }} />

      <div className="relative max-w-lg mx-auto px-4 py-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 rounded-2xl px-5 py-4 shadow-sm" style={{ background: 'rgba(253,250,245,0.95)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 00.45-1.136v-.813a2.25 2.25 0 00-.45-1.136L19.05 11H4.95l-.75 1.045A2.25 2.25 0 003.75 13.5v.813c0 .404.12.8.345 1.136l.404.566A2.25 2.25 0 006.362 17h11.276a2.25 2.25 0 001.863-.985l.299-.415zM12 17.25v3.75" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">بوابة المختبر</p>
              <p className="font-bold text-[#1F2937] text-sm">{labName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {scanCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: '#D1FAE5' }}>
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-green-700">{scanCount} تحقق</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              خروج
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-3xl shadow-xl p-7" style={{ background: 'rgba(253,250,245,0.97)', backdropFilter: 'blur(12px)' }}>

          {/* Icon + title */}
          <div className="flex items-center gap-4 mb-7 pb-6 border-b border-[#E5E7EB]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' }}>
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">مسح كود التحقق</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">أدخل الكود الظاهر في تطبيق المريض</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleScan} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">كود الإحالة</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, ''))}
                placeholder="أدخل الكود هنا"
                required
                maxLength={32}
                autoFocus
                className="flex h-14 w-full rounded-2xl border-2 border-[#D1D5DB] bg-white px-5 text-base font-mono tracking-[0.2em] uppercase text-[#1F2937] placeholder:text-[#9CA3AF] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
              />
              <p className="text-xs text-[#9CA3AF] mt-1.5 text-center">
                الكود مكوّن من 32 خانة بالأرقام والحروف الإنجليزية
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length < 4}
              className="w-full h-13 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-40 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)', height: '52px' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري التحقق...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  تحقق وأضف شارة السلامة الصحية
                </>
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div
              className={`mt-5 rounded-2xl p-5 text-center transition-all duration-300 ${
                result === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result === 'success' ? (
                <>
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full mb-3" style={{ background: '#D1FAE5' }}>
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="font-bold text-green-800 mb-1">تم التحقق بنجاح</p>
                  <p className="text-sm text-green-600">{message}</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full mb-3" style={{ background: '#FEE2E2' }}>
                    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="font-bold text-red-700 mb-1">فشل التحقق</p>
                  <p className="text-sm text-red-500">{message}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#9CA3AF] mt-5">
          بعد التحقق سيظهر في ملف المستخدم شارة تأكيد السلامة الصحية
        </p>
      </div>
    </main>
  );
}
