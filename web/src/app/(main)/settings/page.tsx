'use client';

import Link from 'next/link';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'معلومات الحساب',
      icon: '👤',
      description: 'عرض وتعديل معلومات حسابك',
      href: '/settings/account',
      color: 'bg-emerald-50',
    },
    {
      title: 'الأمان',
      icon: '🔐',
      description: 'كلمات المرور والجلسات والتحقق',
      href: '/settings/security',
      color: 'bg-amber-50',
    },
    {
      title: 'الخصوصية',
      icon: '🔒',
      description: 'من يرى معلوماتك ويتواصل معك',
      href: '/settings/privacy',
      color: 'bg-sage-50',
    },
    {
      title: 'الإشعارات',
      icon: '🔔',
      description: 'تحكم في الإشعارات',
      href: '/settings/notifications',
      color: 'bg-blue-50',
    },
    {
      title: 'المظهر',
      icon: '🎨',
      description: 'تخصيص مظهر التطبيق',
      href: '/settings/appearance',
      color: 'bg-purple-50',
    },
    {
      title: 'اللغة',
      icon: '🌐',
      description: 'اختر لغة الواجهة',
      href: '/settings/language',
      color: 'bg-rose-50',
    },
    {
      title: 'المساعدة',
      icon: '❓',
      description: 'احصل على المساعدة',
      href: '/settings/help',
      color: 'bg-orange-50',
    },
    {
      title: 'الإبلاغ',
      icon: '🐛',
      description: 'أخبرنا عن مشكلة',
      href: '/settings/report',
      color: 'bg-red-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900">الإعدادات</h1>
          <p className="text-emerald-700/70 mt-2">إدارة حسابك وتخصيص تجربتك</p>
        </div>

        <div className="grid gap-4">
          {settingsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200/50 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center text-2xl shadow-inner`}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 text-lg">{section.title}</h3>
                  <p className="text-emerald-700/70 text-sm">{section.description}</p>
                </div>
                <span className="text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}