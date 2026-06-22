'use client';

import Link from 'next/link';
import {
  User, ShieldCheck, Lock, Bell, Palette, Globe,
  Question, Bug, Fingerprint, CaretLeft, IdentificationCard, Envelope,
} from '@phosphor-icons/react';

const sections = [
  {
    title: 'الملف الشخصي',
    icon: User,
    description: 'عرض وتعديل ملفك الشخصي وصورتك',
    href: '/profile',
    accent: 'var(--primary)',
    bg: 'color-mix(in srgb, var(--primary) 8%, transparent)',
  },
  {
    title: 'الحساب',
    icon: IdentificationCard,
    description: 'اسم المستخدم وبيانات حسابك الأساسية',
    href: '/settings/account',
    accent: 'var(--secondary)',
    bg: 'color-mix(in srgb, var(--secondary) 8%, transparent)',
  },
  {
    title: 'البريد الإلكتروني',
    icon: Envelope,
    description: 'تغيير بريدك الإلكتروني وتأكيده',
    href: '/settings/email',
    accent: '#0ea5e9',
    bg: 'color-mix(in srgb, #0ea5e9 8%, transparent)',
  },
  {
    title: 'الأمان',
    icon: ShieldCheck,
    description: 'كلمات المرور، الجلسات، والتحقق بخطوتين',
    href: '/settings/security',
    accent: '#f59e0b',
    bg: 'color-mix(in srgb, #f59e0b 8%, transparent)',
  },
  {
    title: 'الخصوصية',
    icon: Lock,
    description: 'من يرى معلوماتك ويتواصل معك',
    href: '/settings/privacy',
    accent: '#06b6d4',
    bg: 'color-mix(in srgb, #06b6d4 8%, transparent)',
  },
  {
    title: 'الإشعارات',
    icon: Bell,
    description: 'تحكم في إشعاراتك وتنبيهاتك',
    href: '/settings/notifications',
    accent: '#8b5cf6',
    bg: 'color-mix(in srgb, #8b5cf6 8%, transparent)',
  },
  {
    title: 'المظهر',
    icon: Palette,
    description: 'تخصيص ألوان ومظهر التطبيق',
    href: '/settings/appearance',
    accent: '#ec4899',
    bg: 'color-mix(in srgb, #ec4899 8%, transparent)',
  },
  {
    title: 'اللغة',
    icon: Globe,
    description: 'اختر لغة الواجهة المفضلة',
    href: '/settings/language',
    accent: '#0284c7',
    bg: 'color-mix(in srgb, #0284c7 8%, transparent)',
  },
  {
    title: 'إدارة الموافقات',
    icon: Fingerprint,
    description: 'طلبات مشاركة البيانات الطبية والجينية',
    href: '/settings/consent',
    accent: '#10b981',
    bg: 'color-mix(in srgb, #10b981 8%, transparent)',
  },
  {
    title: 'المساعدة',
    icon: Question,
    description: 'احصل على مساعدة ودعم',
    href: '/settings/help',
    accent: '#64748b',
    bg: 'color-mix(in srgb, #64748b 8%, transparent)',
  },
  {
    title: 'الإبلاغ عن مشكلة',
    icon: Bug,
    description: 'أخبرنا عن خطأ أو مشكلة تقنية',
    href: '/settings/report',
    accent: '#ef4444',
    bg: 'color-mix(in srgb, #ef4444 8%, transparent)',
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--foreground)' }}>الإعدادات</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          إدارة حسابك وتخصيص تجربتك في طيبت
        </p>
      </div>

      <div className="space-y-2">
        {sections.map(({ title, icon: Icon, description, href, accent, bg }) => (
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
                {title}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                {description}
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
