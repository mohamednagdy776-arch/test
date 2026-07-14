'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Avatar } from '@/components/ui/Avatar';
import { useT } from '@/i18n/I18nProvider';

const ACCOUNT_SECTIONS = [
  {
    href: '/settings/email',
    icon: '📧',
    titleKey: 'settings.account.section.email.title',
    descKey: 'settings.account.section.email.desc',
  },
  {
    href: '/settings/security',
    icon: '🔐',
    titleKey: 'settings.account.section.security.title',
    descKey: 'settings.account.section.security.desc',
  },
  {
    href: '/settings/privacy',
    icon: '🔒',
    titleKey: 'settings.account.section.privacy.title',
    descKey: 'settings.account.section.privacy.desc',
  },
  {
    href: '/settings/notifications',
    icon: '🔔',
    titleKey: 'settings.account.section.notifications.title',
    descKey: 'settings.account.section.notifications.desc',
  },
  {
    href: '/profile',
    icon: '👤',
    titleKey: 'settings.account.section.profile.title',
    descKey: 'settings.account.section.profile.desc',
  },
];

export default function AccountPage() {
  const { t } = useT();
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
    staleTime: 300_000,
  });

  const me = (data as any)?.data ?? data;
  const email: string = me?.email ?? '';
  const name: string = me?.fullName ?? me?.firstName ?? '';
  const avatarUrl: string | undefined = me?.avatarUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> {t('lang.back')}
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">{t('settings.account.title')}</h1>
          <p className="text-[var(--primary)]/70 mt-2">{t('settings.account.subtitle')}</p>
        </div>

        {/* Account summary card */}
        {(name || email) && (
          <div className="rounded-2xl bg-[var(--card)] backdrop-blur-sm border border-[var(--border)]/50 p-5 flex items-center gap-4">
            {/* Was a hardcoded initial-letter div, never checked for a real
                uploaded avatar at all (#356). */}
            <Avatar src={avatarUrl} name={name} size="lg" shape="rounded" />
            <div>
              {name && <p className="font-bold text-[var(--foreground)]">{name}</p>}
              {email && <p className="text-sm text-[var(--primary)]/70">{email}</p>}
            </div>
          </div>
        )}

        {/* Section links */}
        <div className="rounded-2xl bg-[var(--card)] backdrop-blur-sm border border-[var(--border)]/50 divide-y divide-[var(--border)]/30 overflow-hidden">
          {ACCOUNT_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-5 hover:bg-[var(--muted)]/50 transition-colors group"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[var(--muted)] to-[var(--border)] flex items-center justify-center text-lg">
                {section.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--foreground)]">{t(section.titleKey)}</p>
                <p className="text-sm text-[var(--primary)]/70 mt-0.5">{t(section.descKey)}</p>
              </div>
              <span className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:-translate-x-1 transition-all">←</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
