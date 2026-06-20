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
      setMessage('تم التحقق من المستخدم وإضافة شارة الصحة بنجاح');
      setCode('');
    } catch (err: any) {
      setResult('error');
      const msg = err?.response?.data?.message;
      setMessage(
        msg === 'Invalid, expired, or already used referral code'
          ? 'الكود غير صالح أو منتهي الصلاحية أو مستخدم مسبقاً'
          : msg === 'Invalid or expired lab token'
          ? 'انتهت جلسة المختبر، يرجى تسجيل الدخول مجدداً'
          : 'حدث خطأ، يرجى المحاولة مجدداً',
      );
      if (msg === 'Invalid or expired lab token') {
        sessionStorage.clear();
        router.replace('/lab');
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-sm">
          <div>
            <p className="text-xs text-gray-500">تسجيل دخول بوابة المختبر</p>
            <p className="font-bold text-gray-900">{labName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
          >
            خروج
          </button>
        </div>

        {/* Scan Form */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">مسح كود المستخدم</h2>
          <p className="text-sm text-gray-500 mb-6">
            أدخل الكود الظاهر في تطبيق المستخدم أو امسح رمز QR
          </p>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كود الإحالة</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكود هنا"
                required
                maxLength={32}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-green-400/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? 'جاري التحقق...' : 'تحقق وأضف شارة الصحة'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div
              className={`mt-4 rounded-xl p-4 text-sm font-medium text-center ${
                result === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {result === 'success' && <span className="text-2xl block mb-2">✅</span>}
              {result === 'error' && <span className="text-2xl block mb-2">❌</span>}
              {message}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          بعد التحقق، سيظهر في ملف المستخدم شارة تأكيد السلامة الصحية
        </p>
      </div>
    </div>
  );
}
