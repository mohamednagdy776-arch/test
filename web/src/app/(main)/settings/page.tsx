'use client';

import Link from 'next/link';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'الأمان وتسجيل الدخول',
      icon: '🔐',
      description: 'كلمات المرور، الجلسات، التحقق بخطوتين',
      href: '/settings/security',
    },
    {
      title: 'الخصوصية',
      icon: '🔒',
      description: 'من يمكنه رؤية معلوماتك ومن يمكنه التواصل معك',
      href: '/settings/privacy',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#213448]">الإعدادات</h1>
        <p className="text-sm text-[#547792] mt-1">إدارة حسابك وإعدادات الخصوصية</p>
      </div>

      <div className="grid gap-4">
        {settingsSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block p-5 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 hover:border-[#547792]/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{section.icon}</div>
              <div>
                <h3 className="font-semibold text-[#213448]">{section.title}</h3>
                <p className="text-sm text-[#547792]">{section.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}