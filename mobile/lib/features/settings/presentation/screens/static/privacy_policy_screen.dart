import 'package:flutter/material.dart';
import 'static_content_scaffold.dart';

// Mirrors web's privacy/page.tsx verbatim (Phase 29 static-content parity)
// -- hardcoded here since it's a short, pure static Arabic page with no
// dynamic data (a prior audit confirmed this; see help_settings_screen.dart).
// Named PrivacyPolicyScreen (not PrivacyScreen/PrivacySettingsScreen) to
// avoid clashing with the existing user-privacy-*settings* screen, which is
// a different, unrelated feature (privacy_settings_screen.dart).
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  static const _sections = [
    StaticSection(
      '1. البيانات التي نجمعها',
      'نجمع المعلومات التي تقدّمها عند التسجيل (الاسم، البريد، الهاتف، تاريخ الميلاد) ومعلومات الملف الشخصي (المذهب، نمط الحياة، التعليم، التفضيلات) لتقديم خدمة المطابقة.',
    ),
    StaticSection(
      '2. كيف نستخدم بياناتك',
      'نستخدم بياناتك لحساب درجات التوافق، وعرض الملفات المناسبة، وتحسين الخدمة. لا نبيع بياناتك الشخصية لأطراف ثالثة.',
    ),
    StaticSection(
      '3. تشفير الرسائل',
      'تُخزَّن محتويات المحادثات مشفّرة. ونطبّق إجراءات أمنية لحماية بياناتك أثناء النقل والتخزين.',
    ),
    StaticSection(
      '4. التحكم في الخصوصية',
      'يمكنك ضبط مستوى ظهور ملفك، وحظر المستخدمين، وتقييد التفاعلات من إعدادات الخصوصية في أي وقت.',
    ),
    StaticSection(
      '5. ملفات تعريف الارتباط',
      'نستخدم تخزينًا محليًا لإدارة جلستك وتفضيلاتك. لا تُستخدم هذه البيانات للتتبّع الإعلاني.',
    ),
    StaticSection(
      '6. حقوقك',
      'يحق لك الوصول إلى بياناتك وتصديرها وحذفها. توفّر المنصة خيار تصدير البيانات وحذف الحساب من الإعدادات.',
    ),
    StaticSection(
      '7. التواصل',
      'لأي استفسار يخص الخصوصية، تواصل معنا عبر صفحة المساعدة داخل المنصة.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return const StaticContentScaffold(
      appBarTitle: 'سياسة الخصوصية',
      title: 'سياسة الخصوصية',
      subtitle: 'Privacy Policy · آخر تحديث: يونيو 2026',
      sections: _sections,
    );
  }
}
