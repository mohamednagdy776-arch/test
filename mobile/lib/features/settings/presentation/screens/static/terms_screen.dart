import 'package:flutter/material.dart';
import '../../../../../core/constants/theme.dart';
import 'privacy_policy_screen.dart';
import 'static_content_scaffold.dart';

// Mirrors web's terms/page.tsx verbatim (Phase 29 static-content parity) --
// hardcoded here since it's a short, pure static Arabic page with no
// dynamic data (a prior audit confirmed this; see help_settings_screen.dart).
// Section 4 keeps web's one bit of real interactivity: an inline link to
// the privacy policy (web: <Link href="/privacy">), here pushing
// PrivacyPolicyScreen directly instead of a route (same pattern app_router
// already uses for match/chat/group detail -- a plain in-app push, no
// GoRoute needed).
class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  static const _sections = [
    StaticSection(
      '1. قبول الشروط',
      'باستخدامك منصة طيبت، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يُرجى عدم استخدام المنصة.',
    ),
    StaticSection(
      '2. أهلية الاستخدام',
      'يجب أن يكون عمرك 18 عامًا على الأقل، وأن تكون بنية جادة للزواج وفق الضوابط الإسلامية. التسجيل مخصص للأفراد الباحثين عن شريك حياة حلال.',
    ),
    StaticSection(
      '3. السلوك على المنصة',
      'يلتزم المستخدم بالاحترام والأدب، ويُمنع نشر أي محتوى مخالف للقيم الإسلامية أو محتوى مسيء أو احتيالي. تحتفظ المنصة بحق إزالة المحتوى المخالف وتعليق الحسابات.',
    ),
    _PrivacyLinkSection(),
    StaticSection(
      '5. التوافق والمطابقة بالذكاء الاصطناعي',
      'تُقدّم المنصة درجات توافق استرشادية تعتمد على معايير دينية وحياتية. هذه الدرجات للمساعدة فقط ولا تُعد ضمانًا.',
    ),
    StaticSection(
      '6. إنهاء الحساب',
      'يمكنك إلغاء تنشيط أو حذف حسابك في أي وقت من الإعدادات. كما يحق للمنصة إنهاء الحسابات المخالفة.',
    ),
    StaticSection(
      '7. التعديلات',
      'قد نُحدّث هذه الشروط من وقت لآخر، وسيتم إشعارك بالتغييرات الجوهرية.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return const StaticContentScaffold(
      appBarTitle: 'شروط الخدمة',
      title: 'شروط الخدمة',
      subtitle: 'Terms of Service · آخر تحديث: يونيو 2026',
      sections: _sections,
    );
  }
}

class _PrivacyLinkSection extends StatelessWidget {
  const _PrivacyLinkSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('4. الخصوصية وحماية البيانات', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Wrap(
          children: [
            const Text('نحمي بياناتك الشخصية ونشفّر الرسائل. لمزيد من التفاصيل راجع ', style: TextStyle(fontSize: 14, height: 1.5)),
            GestureDetector(
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen())),
              child: const Text(
                'سياسة الخصوصية',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: AppTheme.primaryColor,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            const Text('.', style: TextStyle(fontSize: 14, height: 1.5)),
          ],
        ),
      ],
    );
  }
}
