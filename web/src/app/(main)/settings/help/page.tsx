'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const HELP_ITEMS = [
  {
    icon: '❓',
    title: 'الأسئلة الشائعة',
    description: 'ابحث عن إجابات للأسئلة الشائعة',
    href: '#',
    color: 'bg-emerald-100',
  },
  {
    icon: '📖',
    title: 'كيفية الاستخدام',
    description: 'تعلم كيفية استخدام المنصة',
    href: '#',
    color: 'bg-blue-100',
  },
  {
    icon: '📝',
    title: 'السياسات والشروط',
    description: 'اقرأ سياسات الاستخدام',
    href: '#',
    color: 'bg-amber-100',
  },
  {
    icon: '🔒',
    title: 'الخصوصية',
    description: 'كيف نحمي بياناتك',
    href: '/settings/privacy',
    color: 'bg-purple-100',
  },
];

const ContactItem = ({ icon, title, detail, href }: { icon: string; title: string; detail: string; href: string }) => (
  <Link
    href={href}
    className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-emerald-200/50 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
  >
    <span className="text-2xl">{icon}</span>
    <div className="flex-1">
      <h3 className="font-semibold text-emerald-900">{title}</h3>
      <p className="text-emerald-700/70 text-sm">{detail}</p>
    </div>
    <span className="text-emerald-400">→</span>
  </Link>
);

const HelpLink = ({ item }: { item: typeof HELP_ITEMS[0] }) => (
  <Link
    href={item.href}
    className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-emerald-200/50 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
  >
    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-xl`}>
      {item.icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-emerald-900">{item.title}</h3>
      <p className="text-emerald-700/70 text-sm">{item.description}</p>
    </div>
    <span className="text-emerald-400">→</span>
  </Link>
);

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">المساعدة والدعم</h1>
          <p className="text-emerald-700/70 mt-2">احصل على المساعدة وتواصل معنا</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>📋</span> المساعدة
            </CardTitle>
            <CardDescription>موارد الدعم والإجابة على استفساراتك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {HELP_ITEMS.map((item) => (
                <HelpLink key={item.title} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>💬</span> تواصل معنا
            </CardTitle>
            <CardDescription>لديك سؤال أو اقتراح؟</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <ContactItem
                icon="📧"
                title="البريد الإلكتروني"
                detail="support@tayyibt.com"
                href="mailto:support@tayyibt.com"
              />
              <ContactItem
                icon="💬"
                title="الدردشة"
                detail="متواجدون لمساعدتك"
                href="#"
              />
              <ContactItem
                icon="🌐"
                title="وسائل التواصل"
                detail="تابعنا على وسائل التواصل'
                href="#"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}