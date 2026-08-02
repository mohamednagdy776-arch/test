import 'package:flutter/material.dart';
import 'static_content_scaffold.dart';

// Mirrors web's guide/page.tsx verbatim (Phase 29 static-content parity) --
// hardcoded here since it's a short, pure static Arabic page with no
// dynamic data (a prior audit confirmed this; see help_settings_screen.dart).
class GuideScreen extends StatelessWidget {
  const GuideScreen({super.key});

  static const _sections = [
    StaticSection(
      '1. أنشئ حسابك وأكمل ملفك الشخصي',
      'بعد التسجيل، أكمل بياناتك الأساسية والدينية والاجتماعية من صفحة تعديل الملف الشخصي — كلما كان ملفك أكمل، كانت اقتراحات التوافق أدق.',
    ),
    StaticSection(
      '2. حدد إعدادات الخصوصية',
      'من الإعدادات > الخصوصية، اختر من يمكنه رؤية ملفك ومنشوراتك ومراسلتك، بما يناسبك.',
    ),
    StaticSection(
      '3. تصفح الاقتراحات وابدأ التواصل',
      'استعرض ملفات الأشخاص المقترحين في صفحة التوافق (Matching)، ويمكنك إرسال طلب اهتمام أو بدء محادثة وفق إعدادات الطرف الآخر.',
    ),
    StaticSection(
      '4. تحقق من حسابك',
      'أكمل خطوات التحقق من الهوية لزيادة الثقة والحصول على شارة "مُحقَّق" على ملفك الشخصي.',
    ),
    StaticSection(
      '5. حافظ على أمانك',
      'يمكنك في أي وقت حظر أو الإبلاغ عن أي حساب يخالف قواعد الاستخدام، وضبط من يمكنه التواصل معك من الإعدادات.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return const StaticContentScaffold(
      appBarTitle: 'كيفية الاستخدام',
      title: 'كيفية استخدام طيبت',
      subtitle: 'دليل سريع للبدء',
      sections: _sections,
    );
  }
}
