'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> العودة للإعدادات
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">الحساب</h1>
          <p className="text-emerald-700/70 mt-2">إدارة معلومات حسابك وإعداداته</p>
        </div>

        {/* Account summary card */}
        {(name || email) && (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200/50 p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/25">
              {name?.charAt(0) || '؟'}
            </div>
            <div>
              {name && <p className="font-bold text-emerald-900">{name}</p>}
              {email && <p className="text-sm text-emerald-700/70">{email}</p>}
            </div>
          </div>
        )}

        {/* Section links */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200/50 divide-y divide-emerald-100/50 overflow-hidden">
          {ACCOUNT_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-5 hover:bg-emerald-50/50 transition-colors group"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-lg">
                {section.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">{section.title}</p>
                <p className="text-sm text-emerald-700/70 mt-0.5">{section.desc}</p>
              </div>
              <span className="text-emerald-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-all">←</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
