'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Avatar } from '@/components/ui/Avatar';

const ACCOUNT_SECTIONS = [
  {
    href: '/settings/email',
    icon: '📧',
    title: 'البريد الإلكتروني',
    desc: 'تغيير البريد الإلكتروني المرتبط بحسابك',
  },
  {
    href: '/settings/security',
    icon: '🔐',
    title: 'كلمة المرور والأمان',
    desc: 'تغيير كلمة المرور وإدارة الجلسات النشطة',
  },
  {
    href: '/settings/privacy',
    icon: '🔒',
    title: 'الخصوصية',
    desc: 'التحكم في من يرى معلوماتك وبياناتك',
  },
  {
    href: '/settings/notifications',
    icon: '🔔',
    title: 'الإشعارات',
    desc: 'ضبط تفضيلات الإشعارات',
  },
  {
    href: '/profile',
    icon: '👤',
    title: 'الملف الشخصي',
    desc: 'تعديل صورتك وبياناتك الشخصية',
  },
];

export default function AccountPage() {
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
          <span>←</span> العودة للإعدادات
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">الحساب</h1>
          <p className="text-[var(--primary)]/70 mt-2">إدارة معلومات حسابك وإعداداته</p>
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
                <p className="font-semibold text-[var(--foreground)]">{section.title}</p>
                <p className="text-sm text-[var(--primary)]/70 mt-0.5">{section.desc}</p>
              </div>
              <span className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:-translate-x-1 transition-all">←</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
