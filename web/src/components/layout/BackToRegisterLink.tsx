'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useT } from '@/i18n/I18nProvider';

// /terms and /privacy are reached from several places (RegisterForm, login,
// settings...), but only RegisterForm's links carry ?from=register -- an
// in-progress signup has no other way back to the form, and BackToMainLink
// always goes to /dashboard or / regardless of where the user came from, so
// registration progress/context was lost (#389). Only render this extra link
// when we know we actually came from registration.
export function BackToRegisterLink() {
  const searchParams = useSearchParams();
  const { t } = useT();
  if (searchParams.get('from') !== 'register') return null;
  return (
    <Link href="/register" className="mt-1 block text-sm hover:underline" style={{ color: 'var(--primary)' }}>
      ← {t('legal.backToRegistration')}
    </Link>
  );
}
