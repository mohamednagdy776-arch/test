'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';
import { apiClient } from '@/lib/api-client';
import { useT } from '@/i18n/I18nProvider';

const STEPS = [
  { n: '١', labelKey: 'settings.email.step1' },
  { n: '٢', labelKey: 'settings.email.step2' },
  { n: '٣', labelKey: 'settings.email.step3' },
];

export default function ChangeEmailPage() {
  const { t } = useT();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
    staleTime: 300_000,
  });
  const currentEmail: string = meData?.data?.email ?? meData?.email ?? '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDone('');
    // Validate the email format client-side (#731) — an invalid address used to
    // pass the non-empty-only check and only fail server-side.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setError(t('settings.email.invalidFormat'));
      return;
    }
    setLoading(true);
    try {
      const r: any = await authApi.requestEmailChange(newEmail.trim(), currentPassword);
      setDone(r?.message || t('settings.email.confirmSent'));
      setNewEmail('');
      setCurrentPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || t('settings.email.changeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> {t('lang.back')}
        </Link>

        {/* Header */}
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xl shadow-lg shadow-black/10">
              📧
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--primary)]">{t('settings.email.title')}</h1>
              <p className="text-xs text-[var(--primary)]">{t('settings.email.subtitle')}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2 pt-1">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-[var(--muted)] text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                  {s.n}
                </span>
                <p className="text-xs text-[var(--foreground)]">{t(s.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} noValidate className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-lg shadow-black/5">
          {done && (
            <div className="flex items-start gap-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--primary)]">
              <span className="shrink-0 mt-0.5">✓</span>
              <span>{done}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-3 text-sm text-[var(--destructive)]">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {currentEmail && (
            <div className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)]">
              <span className="font-semibold">{t('settings.email.currentLabel')} </span>
              <span className="font-mono">{currentEmail}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">{t('settings.email.newEmailLabel')}</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">{t('settings.email.currentPasswordLabel')}</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newEmail || !currentPassword}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? t('settings.email.sending') : t('settings.email.sendConfirmLink')}
          </button>
        </form>

        {/* Security note */}
        <div className="rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4">
          <p className="text-xs font-bold text-[var(--accent)] mb-1">🔐 {t('settings.email.securityNoteTitle')}</p>
          <p className="text-xs text-[var(--accent)] leading-relaxed">
            {t('settings.email.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
