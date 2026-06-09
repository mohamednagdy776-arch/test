import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الخدمة | Terms of Service — Tayyibt',
  description: 'Terms of Service for the Tayyibt Muslim matchmaking platform.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0FDF4] to-white py-12 px-4">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm" dir="rtl">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← العودة للرئيسية</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">شروط الخدمة</h1>
        <p className="mt-1 text-sm text-gray-500">Terms of Service · آخر تحديث: يونيو 2026</p>

        <section className="mt-8 space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">1. قبول الشروط</h2>
            <p>باستخدامك منصة طيبت، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يُرجى عدم استخدام المنصة.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">2. أهلية الاستخدام</h2>
            <p>يجب أن يكون عمرك 18 عامًا على الأقل، وأن تكون بنية جادة للزواج وفق الضوابط الإسلامية. التسجيل مخصص للأفراد الباحثين عن شريك حياة حلال.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">3. السلوك على المنصة</h2>
            <p>يلتزم المستخدم بالاحترام والأدب، ويُمنع نشر أي محتوى مخالف للقيم الإسلامية أو محتوى مسيء أو احتيالي. تحتفظ المنصة بحق إزالة المحتوى المخالف وتعليق الحسابات.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">4. الخصوصية وحماية البيانات</h2>
            <p>نحمي بياناتك الشخصية ونشفّر الرسائل. لمزيد من التفاصيل راجع <Link href="/privacy" className="text-emerald-600 hover:underline">سياسة الخصوصية</Link>.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">5. التوافق والمطابقة بالذكاء الاصطناعي</h2>
            <p>تُقدّم المنصة درجات توافق استرشادية تعتمد على معايير دينية وحياتية. هذه الدرجات للمساعدة فقط ولا تُعد ضمانًا.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">6. إنهاء الحساب</h2>
            <p>يمكنك إلغاء تنشيط أو حذف حسابك في أي وقت من الإعدادات. كما يحق للمنصة إنهاء الحسابات المخالفة.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">7. التعديلات</h2>
            <p>قد نُحدّث هذه الشروط من وقت لآخر، وسيتم إشعارك بالتغييرات الجوهرية.</p>
          </div>
        </section>
      </article>
    </main>
  );
}
