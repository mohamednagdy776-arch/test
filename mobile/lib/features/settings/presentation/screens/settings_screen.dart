import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/constants/theme.dart';

class _SettingsSection {
  final IconData icon;
  final String title;
  final String description;
  final String route;
  final Color accent;

  const _SettingsSection({
    required this.icon,
    required this.title,
    required this.description,
    required this.route,
    required this.accent,
  });
}

// Mirrors web/src/app/(main)/settings/page.tsx's section list (profile is
// skipped here -- it's already the entry point mobile users tap through to
// reach this screen, see ProfileScreen's menu).
const _sections = [
  _SettingsSection(
    icon: Icons.badge_outlined,
    title: 'الحساب',
    description: 'إدارة حسابك',
    route: AppRoutes.settingsAccount,
    accent: AppTheme.secondaryColor,
  ),
  _SettingsSection(
    icon: Icons.email_outlined,
    title: 'البريد الإلكتروني',
    description: 'تغيير بريدك الإلكتروني',
    route: AppRoutes.settingsEmail,
    accent: Color(0xFF0EA5E9),
  ),
  _SettingsSection(
    icon: Icons.shield_outlined,
    title: 'الأمان',
    description: 'الجلسات، التحقق بخطوتين، كلمة المرور',
    route: AppRoutes.settingsSecurity,
    accent: Color(0xFFF59E0B),
  ),
  _SettingsSection(
    icon: Icons.verified_outlined,
    title: 'توثيق الهوية',
    description: 'وثّق هويتك واحصل على شارة موثّق',
    route: AppRoutes.settingsVerification,
    accent: AppTheme.accentColor,
  ),
  _SettingsSection(
    icon: Icons.lock_outline,
    title: 'الخصوصية',
    description: 'من يرى ملفك، الحظر، تصدير بياناتك',
    route: AppRoutes.settingsPrivacy,
    accent: Color(0xFF06B6D4),
  ),
  _SettingsSection(
    icon: Icons.notifications_outlined,
    title: 'الإشعارات',
    description: 'إشعارات التطبيق والنشرة البريدية',
    route: AppRoutes.settingsNotifications,
    accent: Color(0xFF8B5CF6),
  ),
  _SettingsSection(
    icon: Icons.palette_outlined,
    title: 'المظهر',
    description: 'إمكانية الوصول والعرض',
    route: AppRoutes.settingsAppearance,
    accent: Color(0xFFEC4899),
  ),
  _SettingsSection(
    icon: Icons.language_outlined,
    title: 'اللغة',
    description: 'لغة التطبيق',
    route: AppRoutes.settingsLanguage,
    accent: Color(0xFF0284C7),
  ),
  _SettingsSection(
    icon: Icons.fingerprint,
    title: 'إدارة الموافقات',
    description: 'طلبات مشاركة البيانات الطبية والجينية',
    route: AppRoutes.settingsConsent,
    accent: Color(0xFF10B981),
  ),
  _SettingsSection(
    icon: Icons.help_outline,
    title: 'المساعدة',
    description: 'الأسئلة الشائعة وطرق التواصل',
    route: AppRoutes.settingsHelp,
    accent: Color(0xFF64748B),
  ),
  _SettingsSection(
    icon: Icons.bug_report_outlined,
    title: 'الإبلاغ عن مشكلة',
    description: 'أخبرنا عن خطأ أو مقترح',
    route: AppRoutes.settingsReport,
    accent: Color(0xFFEF4444),
  ),
];

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _sections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final section = _sections[index];
          return Card(
            margin: EdgeInsets.zero,
            child: ListTile(
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: section.accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(section.icon, color: section.accent),
              ),
              title: Text(section.title, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(section.description),
              trailing: const Icon(Icons.chevron_left),
              onTap: () => context.push(section.route),
            ),
          );
        },
      ),
    );
  }
}
