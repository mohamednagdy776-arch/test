import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BackToMainLink } from '@/components/layout/BackToMainLink';
import { BackToRegisterLink } from '@/components/layout/BackToRegisterLink';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Privacy Policy — Tayyibt',
  description: 'Privacy Policy for the Tayyibt Muslim matchmaking platform.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-12 px-4" style={{ background: 'var(--background)' }}>
      <article className="mx-auto max-w-3xl rounded-3xl p-8 shadow-sm" style={{ background: 'var(--card)' }} dir="rtl">
        <BackToMainLink />
        <Suspense fallback={null}>
          <BackToRegisterLink />
        </Suspense>
        <h1 className="mt-4 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>سياسة الخصوصية</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>Privacy Policy · آخر تحديث: يونيو 2026</p>

        <section className="mt-8 space-y-6 leading-relaxed" style={{ color: 'var(--card-foreground)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>1. البيانات التي نجمعها</h2>
            <p>نجمع المعلومات التي تقدّمها عند التسجيل (الاسم، البريد، الهاتف، تاريخ الميلاد) ومعلومات الملف الشخصي (المذهب، نمط الحياة، التعليم، التفضيلات) لتقديم خدمة المطابقة.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>2. كيف نستخدم بياناتك</h2>
            <p>نستخدم بياناتك لحساب درجات التوافق، وعرض الملفات المناسبة، وتحسين الخدمة. لا نبيع بياناتك الشخصية لأطراف ثالثة.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>3. تشفير الرسائل</h2>
            <p>تُخزَّن محتويات المحادثات مشفّرة. ونطبّق إجراءات أمنية لحماية بياناتك أثناء النقل والتخزين.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>4. التحكم في الخصوصية</h2>
            <p>يمكنك ضبط مستوى ظهور ملفك، وحظر المستخدمين، وتقييد التفاعلات من إعدادات الخصوصية في أي وقت.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>5. ملفات تعريف الارتباط</h2>
            <p>نستخدم تخزينًا محليًا لإدارة جلستك وتفضيلاتك. لا تُستخدم هذه البيانات للتتبّع الإعلاني.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>6. حقوقك</h2>
            <p>يحق لك الوصول إلى بياناتك وتصديرها وحذفها. توفّر المنصة خيار تصدير البيانات وحذف الحساب من الإعدادات.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>7. التواصل</h2>
            <p>لأي استفسار يخص الخصوصية، تواصل معنا عبر صفحة المساعدة داخل المنصة.</p>
          </div>
        </section>
      </article>
    </main>
  );
}
