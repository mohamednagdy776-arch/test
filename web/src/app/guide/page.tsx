import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'كيفية الاستخدام | Tayyibt',
  description: 'دليل استخدام منصة طيبت خطوة بخطوة.',
};

const STEPS = [
  {
    title: '1. أنشئ حسابك وأكمل ملفك الشخصي',
    body: 'بعد التسجيل، أكمل بياناتك الأساسية والدينية والاجتماعية من صفحة تعديل الملف الشخصي — كلما كان ملفك أكمل، كانت اقتراحات التوافق أدق.',
  },
  {
    title: '2. حدد إعدادات الخصوصية',
    body: 'من الإعدادات > الخصوصية، اختر من يمكنه رؤية ملفك ومنشوراتك ومراسلتك، بما يناسبك.',
  },
  {
    title: '3. تصفح الاقتراحات وابدأ التواصل',
    body: 'استعرض ملفات الأشخاص المقترحين في صفحة التوافق (Matching)، ويمكنك إرسال طلب اهتمام أو بدء محادثة وفق إعدادات الطرف الآخر.',
  },
  {
    title: '4. تحقق من حسابك',
    body: 'أكمل خطوات التحقق من الهوية لزيادة الثقة والحصول على شارة "مُحقَّق" على ملفك الشخصي.',
  },
  {
    title: '5. حافظ على أمانك',
    body: 'يمكنك في أي وقت حظر أو الإبلاغ عن أي حساب يخالف قواعد الاستخدام، وضبط من يمكنه التواصل معك من الإعدادات.',
  },
];

export default function GuidePage() {
  return (
    // See faq/page.tsx: ThemeProvider is global (mounted in
    // web/src/store/providers.tsx), this page just needed to use the theme
    // CSS variables instead of hardcoded light colors (#395).
    <main className="min-h-screen py-12 px-4" style={{ background: 'var(--background)' }}>
      <article className="mx-auto max-w-3xl rounded-3xl p-8 shadow-sm" style={{ background: 'var(--card)' }} dir="rtl">
        <Link href="/settings/help" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← العودة للمساعدة</Link>
        <h1 className="mt-4 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>كيفية استخدام طيبت</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>دليل سريع للبدء</p>

        <section className="mt-8 space-y-6 leading-relaxed" style={{ color: 'var(--card-foreground)' }}>
          {STEPS.map((step) => (
            <div key={step.title}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{step.title}</h2>
              <p className="mt-1">{step.body}</p>
            </div>
          ))}
        </section>
      </article>
    </main>
  );
}
