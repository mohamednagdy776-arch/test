import 'package:flutter/material.dart';
import '../../../../core/constants/theme.dart';

const _languages = [
  ('ar', 'العربية', '🇸🇦', true),
  ('en', 'English', '🇺🇸', false),
  ('ur', 'اردو', '🇵🇰', false),
  ('tr', 'Türkçe', '🇹🇷', false),
  ('id', 'Bahasa Indonesia', '🇮🇩', false),
  ('ms', 'Bahasa Melayu', '🇲🇾', false),
  ('fr', 'Français', '🇫🇷', false),
];

// Mirrors web's settings/language/page.tsx's language list -- but on web
// this switcher is purely a client-side i18n toggle (setLocale flips
// localStorage + <html dir/lang>, no backend persistence at all). Mobile
// is hardcoded to Arabic/RTL app-wide (Locale('ar') in main.dart, Phase 1)
// with no i18n string tables for the other 6 languages, so actually
// switching languages here would silently do nothing (or half-translate
// the UI). Rather than build a fake switcher that looks functional but
// isn't, this shows Arabic as the active (and only working) language and
// the rest as a preview of what's planned, matching reality instead of
// over-building a real i18n system web itself doesn't meaningfully rely on.
class LanguageSettingsScreen extends StatelessWidget {
  const LanguageSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('اللغة')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(color: AppTheme.accentColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: const Text(
              'التطبيق متاح حالياً باللغة العربية فقط. اللغات الأخرى قيد التطوير.',
              style: TextStyle(fontSize: 12, color: AppTheme.accentColor),
            ),
          ),
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              children: _languages
                  .map((l) => ListTile(
                        leading: Text(l.$3, style: const TextStyle(fontSize: 24)),
                        title: Text(l.$2),
                        enabled: l.$4,
                        trailing: l.$4
                            ? const Icon(Icons.check_circle, color: AppTheme.successColor)
                            : const Text('قريباً', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}
