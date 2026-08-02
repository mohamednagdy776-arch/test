import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/routes.dart';
import 'static/faq_screen.dart';
import 'static/guide_screen.dart';
import 'static/privacy_policy_screen.dart';
import 'static/terms_screen.dart';

const _supportEmail = 'support@tayyibt.com';

// Mirrors web's settings/help/page.tsx -- a static hub, not an API-driven
// screen on web either. Web links out to /faq, /guide, /terms, /privacy
// (their own top-level static pages) and a mailto: link. Phase 29 adds
// those: the 4 static pages now exist as native screens (pushed directly,
// same pattern app_router already uses for match/chat/group detail -- no
// GoRoute needed for content that's always entered from this one place)
// and url_launcher opens the real OS mail client for the support address,
// replacing the reference-only text this card used to show.
class HelpSettingsScreen extends StatelessWidget {
  const HelpSettingsScreen({super.key});

  Future<void> _emailSupport(BuildContext context) async {
    final uri = Uri(scheme: 'mailto', path: _supportEmail);
    var launched = false;
    try {
      launched = await launchUrl(uri);
    } catch (_) {
      launched = false;
    }
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر فتح تطبيق البريد الإلكتروني')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المساعدة والدعم')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Text('الموارد', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.help_outline),
                  title: const Text('الأسئلة الشائعة'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const FaqScreen())),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.menu_book_outlined),
                  title: const Text('دليل الاستخدام'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GuideScreen())),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.description_outlined),
                  title: const Text('الشروط والأحكام'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TermsScreen())),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined),
                  title: const Text('سياسة الخصوصية'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen())),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.email_outlined),
                  title: const Text('البريد الإلكتروني'),
                  subtitle: const Text(_supportEmail),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => _emailSupport(context),
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
