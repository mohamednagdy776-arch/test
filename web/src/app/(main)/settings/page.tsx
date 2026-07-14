'use client';

import Link from 'next/link';
import {
  User, ShieldCheck, Lock, Bell, Palette, Globe, SealCheck,
  Question, Bug, Fingerprint, CaretLeft, IdentificationCard, Envelope, Gear,
} from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useT } from '@/i18n/I18nProvider';

const sections = [
  {
    titleKey: 'settings.section.profile.title',
    icon: User,
    descriptionKey: 'settings.section.profile.description',
    href: '/profile',
    accent: 'var(--primary)',
    bg: 'color-mix(in srgb, var(--primary) 8%, transparent)',
  },
  {
    titleKey: 'settings.section.account.title',
    icon: IdentificationCard,
    descriptionKey: 'settings.section.account.description',
    href: '/settings/account',
    accent: 'var(--secondary)',
    bg: 'color-mix(in srgb, var(--secondary) 8%, transparent)',
  },
  {
    titleKey: 'settings.section.email.title',
    icon: Envelope,
    descriptionKey: 'settings.section.email.description',
    href: '/settings/email',
    accent: '#0ea5e9',
    bg: 'color-mix(in srgb, #0ea5e9 8%, transparent)',
  },
  {
    titleKey: 'settings.section.security.title',
    icon: ShieldCheck,
    descriptionKey: 'settings.section.security.description',
    href: '/settings/security',
    accent: '#f59e0b',
    bg: 'color-mix(in srgb, #f59e0b 8%, transparent)',
  },
  {
    titleKey: 'settings.section.verification.title',
    icon: SealCheck,
    descriptionKey: 'settings.section.verification.description',
    href: '/settings/verification',
    accent: '#B8892A',
    bg: 'color-mix(in srgb, #B8892A 10%, transparent)',
  },
  {
    titleKey: 'settings.section.privacy.title',
    icon: Lock,
    descriptionKey: 'settings.section.privacy.description',
    href: '/settings/privacy',
    accent: '#06b6d4',
    bg: 'color-mix(in srgb, #06b6d4 8%, transparent)',
  },
  {
    titleKey: 'settings.section.notifications.title',
    icon: Bell,
    descriptionKey: 'settings.section.notifications.description',
    href: '/settings/notifications',
    accent: '#8b5cf6',
    bg: 'color-mix(in srgb, #8b5cf6 8%, transparent)',
  },
  {
    titleKey: 'settings.section.appearance.title',
    icon: Palette,
    descriptionKey: 'settings.section.appearance.description',
    href: '/settings/appearance',
    accent: '#ec4899',
    bg: 'color-mix(in srgb, #ec4899 8%, transparent)',
  },
  {
    titleKey: 'settings.section.language.title',
    icon: Globe,
    descriptionKey: 'settings.section.language.description',
    href: '/settings/language',
    accent: '#0284c7',
    bg: 'color-mix(in srgb, #0284c7 8%, transparent)',
  },
  {
    titleKey: 'settings.section.consent.title',
    icon: Fingerprint,
    descriptionKey: 'settings.section.consent.description',
    href: '/settings/consent',
    accent: '#10b981',
    bg: 'color-mix(in srgb, #10b981 8%, transparent)',
  },
  {
    titleKey: 'settings.section.help.title',
    icon: Question,
    descriptionKey: 'settings.section.help.description',
    href: '/settings/help',
    accent: '#64748b',
    bg: 'color-mix(in srgb, #64748b 8%, transparent)',
  },
  {
    titleKey: 'settings.section.report.title',
    icon: Bug,
    descriptionKey: 'settings.section.report.description',
    href: '/settings/report',
    accent: '#ef4444',
    bg: 'color-mix(in srgb, #ef4444 8%, transparent)',
  },
];

export default function SettingsPage() {
  const { t } = useT();
  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6">
      <PageHeader
        icon={Gear}
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <div className="space-y-2">
        {sections.map(({ titleKey, icon: Icon, descriptionKey, href, accent, bg }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-md"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = accent;
              (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${accent} 3%, var(--card))`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLElement).style.background = 'var(--card)';
            }}
          >
            <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ background: bg }}>
              <Icon size={22} weight="fill" style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold transition-colors duration-200"
                style={{ color: 'var(--foreground)' }}>
                {t(titleKey)}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                {t(descriptionKey)}
              </p>
            </div>
            <CaretLeft
              size={16}
              className="shrink-0 transition-transform duration-200 group-hover:-translate-x-1"
              style={{ color: 'var(--muted-foreground)' }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
