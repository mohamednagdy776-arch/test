import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/constants/theme.dart';

// Mirrors web's settings/help/page.tsx -- a static hub, not an API-driven
// screen on web either. Web links out to /faq, /guide, /terms, /privacy
// (their own top-level static pages) and a mailto: link; none of those
// exist as mobile screens/routes yet and this project has no url_launcher
// dependency to open a mail client or an external page, so building a
// real link-out here would need either new static screens (out of scope
// for a Settings-parity phase) or a new package for a single static
// screen (against this project's minimal-dependency preference). The two
// items that DO map onto something real in the app (report a problem,
// privacy settings) still navigate in-app; the rest are shown as
// reference-only text.
class HelpSettingsScreen extends StatelessWidget {
  const HelpSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المساعدة والدعم')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('الموارد', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  SizedBox(height: 8),
                  Text(
                    'الأسئلة الشائعة، دليل الاستخدام، الشروط والأحكام، وسياسة الخصوصية متاحة على موقع Tayyibt الإلكتروني.',
                    style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.email_outlined),
                  title: Text('البريد الإلكتروني'),
                  subtitle: Text('support@tayyibt.com'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.bug_report_outlined),
                  title: const Text('الإبلاغ عن مشكلة'),
                  subtitle: const Text('أخبرنا عن خطأ أو مقترح'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.settingsReport),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.lock_outline),
                  title: const Text('إعدادات الخصوصية'),
                  subtitle: const Text('تحكم في بياناتك وخصوصيتك'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.settingsPrivacy),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
