import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | Tayyibt',
  description: 'إجابات على الأسئلة الأكثر شيوعاً حول منصة طيبت.',
};

const FAQS = [
  {
    q: 'كيف يعمل نظام التوافق في طيبت؟',
    a: 'تعتمد المنصة على معايير دينية واجتماعية وشخصية يحددها كل مستخدم لاقتراح شركاء توافق مناسبين. درجة التوافق استرشادية وليست ضماناً.',
  },
  {
    q: 'هل بياناتي ومحادثاتي آمنة؟',
    a: 'نعم، الرسائل بين المستخدمين محمية ولا تُعرض علناً. يمكنك مراجعة سياسة الخصوصية لمزيد من التفاصيل حول كيفية حماية بياناتك.',
  },
  {
    q: 'كيف أتحقق من حسابي؟',
    a: 'من الإعدادات، توجه إلى قسم التحقق (Verification) واتبع خطوات رفع المستندات المطلوبة لإتمام عملية التحقق من الهوية.',
  },
  {
    q: 'كيف يمكنني حظر أو الإبلاغ عن مستخدم؟',
    a: 'من صفحة الملف الشخصي لأي مستخدم، اختر خيارات إضافية ثم حظر أو إبلاغ، وسيتم مراجعة البلاغ من قبل فريقنا.',
  },
  {
    q: 'كيف أحذف حسابي؟',
    a: 'من الإعدادات > الأمان، يمكنك اختيار حذف الحساب. سيتم جدولة حذف الحساب ويمكن التراجع عنه خلال فترة السماح المحددة.',
  },
  {
    q: 'من يمكنه رؤية ملفي الشخصي؟',
    a: 'يمكنك التحكم في من يرى ملفك الشخصي ومنشوراتك من خلال إعدادات الخصوصية، حيث يمكن تحديد الظهور للجميع أو الأصدقاء فقط أو نفسك فقط.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0FDF4] to-white py-12 px-4">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm" dir="rtl">
        <Link href="/settings/help" className="text-sm text-emerald-600 hover:underline">← العودة للمساعدة</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">الأسئلة الشائعة</h1>
        <p className="mt-1 text-sm text-gray-500">إجابات سريعة على أكثر الأسئلة تكراراً</p>

        <section className="mt-8 space-y-6 text-gray-700 leading-relaxed">
          {FAQS.map((item) => (
            <div key={item.q}>
              <h2 className="text-lg font-semibold text-gray-900">{item.q}</h2>
              <p className="mt-1">{item.a}</p>
            </div>
          ))}
        </section>
      </article>
    </main>
  );
}
