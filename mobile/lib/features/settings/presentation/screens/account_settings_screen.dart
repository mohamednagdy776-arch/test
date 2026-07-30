import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/utils/media.dart';
import '../../../profile/presentation/providers/profile_providers.dart';

// Mirrors web's settings/account/page.tsx: an account summary card + a menu
// of links (email/security/privacy/notifications/profile) -- on web this
// page does NOT itself surface sessions/2FA/deactivate/delete (those live on
// settings/security instead, see SecuritySettingsScreen); it's genuinely
// just a hub.
class AccountSettingsScreen extends ConsumerWidget {
  const AccountSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الحساب')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          profileAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (profile) => Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundImage: resolveMediaUrl(profile.avatarUrl) != null
                          ? NetworkImage(resolveMediaUrl(profile.avatarUrl)!)
                          : null,
                      child: resolveMediaUrl(profile.avatarUrl) == null
                          ? Text((profile.fullName?.isNotEmpty ?? false) ? profile.fullName![0].toUpperCase() : '?')
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(profile.fullName ?? 'مستخدم', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.email_outlined),
                  title: const Text('البريد الإلكتروني'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.settingsEmail),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.shield_outlined),
                  title: const Text('الأمان'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.settingsSecurity),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.lock_outline),
                  title: const Text('الخصوصية'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.settingsPrivacy),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('الإشعارات'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.settingsNotifications),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.person_outline),
                  title: const Text('الملف الشخصي'),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(AppRoutes.profile),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
