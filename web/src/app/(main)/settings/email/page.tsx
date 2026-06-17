'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';

export default function ChangeEmailPage() {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDone('');
    setLoading(true);
    try {
      const r: any = await authApi.requestEmailChange(newEmail.trim(), currentPassword);
      setDone(r?.message || 'تم إرسال رابط التأكيد إلى البريد الإلكتروني الجديد.');
      setNewEmail('');
      setCurrentPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'تعذّر تغيير البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">تغيير البريد الإلكتروني</h1>
          <p className="text-emerald-700/70 mt-1 text-sm">سنرسل رابط تأكيد إلى البريد الجديد. لن يتغيّر بريدك حتى تؤكّده.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white/80 border border-emerald-100 p-5 space-y-4 shadow">
          {done && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{done}</div>}
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-1">البريد الإلكتروني الجديد</label>
            <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-900 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-1">كلمة المرور الحالية</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-900 focus:outline-none focus:border-emerald-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط التأكيد'}
          </button>
        </form>
      </div>
    </div>
  );
}
