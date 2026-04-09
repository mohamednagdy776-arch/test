'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const HELP_ITEMS = [
  {
    icon: '❓',
    title: 'الأسئلة الشائعة',
    description: 'ابحث عن إجابات للأسئلة الشائعة',
    href: '#',
  },
  {
    icon: '📖',
    title: 'كيفية الاستخدام',
    description: 'تعلم كيفية استخدام المنصة',
    href: '#',
  },
  {
    icon: '📝',
    title: 'السياسات والشروط',
    description: 'اقرأ سياسات الاستخدام والشروط',
    href: '#',
  },
  {
    icon: '🔒',
    title: 'الخصوصية',
    description: 'كيف نحمي بياناتك',
    href: '/settings/privacy',
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
          ← الإعدادات
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#213448]">المساعدة والدعم</h1>
        <p className="text-sm text-[#547792] mt-1">احصل على المساعدة وتواصل معنا</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>📋</span> المساعدة
          </CardTitle>
          <CardDescription>موارد الدعم والإجابة على استفساراتك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {HELP_ITEMS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 hover:border-[#547792]/40 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#213448]">{item.title}</h3>
                  <p className="text-sm text-[#547792]">{item.description}</p>
                </div>
                <span className="text-[#547792]">→</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>💬</span> تواصل معنا
          </CardTitle>
          <CardDescription>لديك سؤال أو اقتراح؟ تواصل معنا</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 hover:border-[#547792]/40 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">📧</span>
              <div className="flex-1">
                <h3 className="font-semibold text-[#213448]">البريد الإلكتروني</h3>
                <p className="text-sm text-[#547792]">support@example.com</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}