import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';

// Mirrors web's settings/appearance/page.tsx -- PARTIALLY. Web offers an
// 18-theme picker (light/dark/special-occasion palettes) on top of the
// accessibility toggles; mobile has no theme-switching infrastructure at
// all (AppTheme is a single hardcoded "Emerald Sanctum" ThemeData, see
// core/constants/theme.dart's header comment -- it's the app's one and only
// theme, matching web's own actual *live default* regardless of its
// 18-theme switcher). Building a real multi-theme system is out of scope
// for a settings-parity phase, so only the three accessibility flags that
// round-trip to the same backend endpoint (settings/appearance) are
// editable here; theme/colorScheme/fontFamily are sent back unchanged on
// save so the account-level record isn't clobbered.
class AppearanceSettingsScreen extends ConsumerStatefulWidget {
  const AppearanceSettingsScreen({super.key});

  @override
  ConsumerState<AppearanceSettingsScreen> createState() => _AppearanceSettingsScreenState();
}

class _AppearanceSettingsScreenState extends ConsumerState<AppearanceSettingsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(appearanceProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(appearanceProvider);
    final notifier = ref.read(appearanceProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('المظهر')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (state.error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(color: AppTheme.dangerColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                  ),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(color: AppTheme.primaryColor, borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.palette, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('السمة الحالية', style: TextStyle(fontWeight: FontWeight.bold)),
                              Text('الحرم الزمردي (Emerald Sanctum) — السمة الوحيدة المتاحة حالياً', style: TextStyle(fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('إمكانية الوصول', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('نص كبير'),
                          subtitle: const Text('زيادة حجم الخط في التطبيق', style: TextStyle(fontSize: 12)),
                          value: state.settings.largeText,
                          onChanged: notifier.setLargeText,
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('تقليل الحركة'),
                          subtitle: const Text('تقليل تأثيرات الحركة والانتقالات', style: TextStyle(fontSize: 12)),
                          value: state.settings.reducedMotion,
                          onChanged: notifier.setReducedMotion,
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('تباين عالٍ'),
                          subtitle: const Text('زيادة التباين لتحسين قراءة النصوص', style: TextStyle(fontSize: 12)),
                          value: state.settings.highContrast,
                          onChanged: notifier.setHighContrast,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: state.isSaving
                      ? null
                      : () async {
                          final ok = await notifier.save();
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(ok ? 'تم حفظ التغييرات' : 'تعذّر حفظ التغييرات')),
                          );
                        },
                  child: state.isSaving
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('حفظ التغييرات'),
                ),
              ],
            ),
    );
  }
}
