import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Privacy Policy — Tayyibt',
  description: 'Privacy Policy for the Tayyibt Muslim matchmaking platform.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0FDF4] to-white py-12 px-4">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm" dir="rtl">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← العودة للرئيسية</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">سياسة الخصوصية</h1>
        <p className="mt-1 text-sm text-gray-500">Privacy Policy · آخر تحديث: يونيو 2026</p>

        <section className="mt-8 space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">1. البيانات التي نجمعها</h2>
            <p>نجمع المعلومات التي تقدّمها عند التسجيل (الاسم، البريد، الهاتف، تاريخ الميلاد) ومعلومات الملف الشخصي (المذهب، نمط الحياة، التعليم، التفضيلات) لتقديم خدمة المطابقة.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">2. كيف نستخدم بياناتك</h2>
            <p>نستخدم بياناتك لحساب درجات التوافق، وعرض الملفات المناسبة، وتحسين الخدمة. لا نبيع بياناتك الشخصية لأطراف ثالثة.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">3. تشفير الرسائل</h2>
            <p>تُخزَّن محتويات المحادثات مشفّرة. ونطبّق إجراءات أمنية لحماية بياناتك أثناء النقل والتخزين.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">4. التحكم في الخصوصية</h2>
            <p>يمكنك ضبط مستوى ظهور ملفك، وحظر المستخدمين، وتقييد التفاعلات من إعدادات الخصوصية في أي وقت.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">5. ملفات تعريف الارتباط</h2>
            <p>نستخدم تخزينًا محليًا لإدارة جلستك وتفضيلاتك. لا تُستخدم هذه البيانات للتتبّع الإعلاني.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">6. حقوقك</h2>
            <p>يحق لك الوصول إلى بياناتك وتصديرها وحذفها. توفّر المنصة خيار تصدير البيانات وحذف الحساب من الإعدادات.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">7. التواصل</h2>
            <p>لأي استفسار يخص الخصوصية، تواصل معنا عبر صفحة المساعدة داخل المنصة.</p>
          </div>
        </section>
      </article>
    </main>
  );
}
