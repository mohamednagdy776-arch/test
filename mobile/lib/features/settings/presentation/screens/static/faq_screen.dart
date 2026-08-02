import 'package:flutter/material.dart';
import 'static_content_scaffold.dart';

// Mirrors web's faq/page.tsx verbatim (Phase 29 static-content parity) --
// hardcoded here since it's a short, pure static Arabic page with no
// dynamic data (a prior audit confirmed this; see help_settings_screen.dart).
class FaqScreen extends StatelessWidget {
  const FaqScreen({super.key});

  static const _sections = [
    StaticSection(
      'كيف يعمل نظام التوافق في طيبت؟',
      'تعتمد المنصة على معايير دينية واجتماعية وشخصية يحددها كل مستخدم لاقتراح شركاء توافق مناسبين. درجة التوافق استرشادية وليست ضماناً.',
    ),
    StaticSection(
      'هل بياناتي ومحادثاتي آمنة؟',
      'نعم، الرسائل بين المستخدمين محمية ولا تُعرض علناً. يمكنك مراجعة سياسة الخصوصية لمزيد من التفاصيل حول كيفية حماية بياناتك.',
    ),
    StaticSection(
      'كيف أتحقق من حسابي؟',
      'من الإعدادات، توجه إلى قسم التحقق (Verification) واتبع خطوات رفع المستندات المطلوبة لإتمام عملية التحقق من الهوية.',
    ),
    StaticSection(
      'كيف يمكنني حظر أو الإبلاغ عن مستخدم؟',
      'من صفحة الملف الشخصي لأي مستخدم، اختر خيارات إضافية ثم حظر أو إبلاغ، وسيتم مراجعة البلاغ من قبل فريقنا.',
    ),
    StaticSection(
      'كيف أحذف حسابي؟',
      'من الإعدادات > الأمان، يمكنك اختيار حذف الحساب. سيتم جدولة حذف الحساب ويمكن التراجع عنه خلال فترة السماح المحددة.',
    ),
    StaticSection(
      'من يمكنه رؤية ملفي الشخصي؟',
      'يمكنك التحكم في من يرى ملفك الشخصي ومنشوراتك من خلال إعدادات الخصوصية، حيث يمكن تحديد الظهور للجميع أو الأصدقاء فقط أو نفسك فقط.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return const StaticContentScaffold(
      appBarTitle: 'الأسئلة الشائعة',
      title: 'الأسئلة الشائعة',
      subtitle: 'إجابات سريعة على أكثر الأسئلة تكراراً',
      sections: _sections,
    );
  }
}
