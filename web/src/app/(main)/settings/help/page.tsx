'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const HELP_ITEMS = [
  {
    icon: '❓',
    title: 'الأسئلة الشائعة',
    description: 'ابحث عن إجابات للأسئلة الشائعة',
    href: '/faq',
    color: 'bg-[var(--muted)]',
  },
  {
    icon: '📖',
    title: 'كيفية الاستخدام',
    description: 'تعلم كيفية استخدام المنصة',
    href: '/guide',
    color: 'bg-blue-100',
  },
  {
    icon: '📝',
    title: 'الشروط والأحكام',
    description: 'اقرأ شروط الاستخدام',
    href: '/terms',
    color: 'bg-[var(--accent)]/15',
  },
  {
    icon: '🔒',
    title: 'سياسة الخصوصية',
    description: 'كيف نحمي بياناتك',
    href: '/privacy',
    color: 'bg-purple-100',
  },
];

const ContactItem = ({ icon, title, detail, href }: { icon: string; title: string; detail: string; href: string }) => {
  // mailto:/tel: links aren't app routes, so next/link's client-side
  // navigation swallowed the click instead of opening the mail client (#138).
  const isExternalProtocol = /^[a-z]+:/i.test(href) && !href.startsWith('/');
  const content = (
    <>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="text-[var(--primary)]/70 text-sm">{detail}</p>
      </div>
      <span className="text-[var(--muted-foreground)]">→</span>
    </>
  );
  const className = "flex items-center gap-4 p-4 rounded-xl bg-[var(--card)]/50 border border-[var(--border)]/50 hover:border-[var(--border)] hover:shadow-md transition-all duration-300";
  return isExternalProtocol ? (
    <a href={href} className={className}>{content}</a>
  ) : (
    <Link href={href} className={className}>{content}</Link>
  );
};

const HelpLink = ({ item }: { item: typeof HELP_ITEMS[0] }) => (
  <Link
    href={item.href}
    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)]/50 border border-[var(--border)]/50 hover:border-[var(--border)] hover:shadow-md transition-all duration-300"
  >
    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-xl`}>
      {item.icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
      <p className="text-[var(--primary)]/70 text-sm">{item.description}</p>
    </div>
    <span className="text-[var(--muted-foreground)]">→</span>
  </Link>
);

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">المساعدة والدعم</h1>
          <p className="text-[var(--primary)]/70 mt-2">احصل على المساعدة وتواصل معنا</p>
        </div>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
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

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
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
                icon="🐛"
                title="الإبلاغ عن مشكلة"
                detail="أخبرنا عن خطأ أو مقترح"
                href="/settings/report"
              />
              <ContactItem
                icon="🔒"
                title="إعدادات الخصوصية"
                detail="تحكم في بياناتك وخصوصيتك"
                href="/settings/privacy"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}