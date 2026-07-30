import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';
import '../../domain/entities/privacy_settings.dart';
import '../../domain/entities/blocked_user.dart';
import '../../../profile/presentation/providers/profile_providers.dart';

const Map<String, String> _visibilityLabels = {
  'public': 'عامة',
  'friends': 'الأصدقاء',
  'friends_of_friends': 'أصدقاء الأصدقاء',
  'only_me': 'أنا فقط',
};

class _PrivacyField {
  final String key;
  final String label;
  final List<String> options;
  const _PrivacyField(this.key, this.label, this.options);
}

// Mirrors web's PRIVACY_FIELDS (settings/privacy/page.tsx) exactly, including
// which visibility options each field excludes.
const _fields = [
  _PrivacyField('whoCanSeePosts', 'من يمكنه رؤية منشوراتي', ['public', 'friends', 'friends_of_friends']),
  _PrivacyField('whoCanSeeFriends', 'من يمكنه رؤية أصدقائي', ['public', 'friends', 'friends_of_friends', 'only_me']),
  _PrivacyField('whoCanSendFriendRequests', 'من يمكنه إرسال طلب صداقة', ['public', 'friends', 'friends_of_friends']),
  _PrivacyField('whoCanSeeProfilePicture', 'من يمكنه رؤية صورة الملف الشخصي', ['public', 'friends', 'friends_of_friends', 'only_me']),
  _PrivacyField('whoCanSeeCoverPhoto', 'من يمكنه رؤية صورة الغلاف', ['public', 'friends', 'friends_of_friends', 'only_me']),
  _PrivacyField('whoCanSeeBio', 'من يمكنه رؤية النبذة', ['public', 'friends', 'friends_of_friends', 'only_me']),
  _PrivacyField('whoCanTagMe', 'من يمكنه الإشارة إليّ', ['public', 'friends', 'friends_of_friends', 'only_me']),
  _PrivacyField('whoCanSendMessages', 'من يمكنه مراسلتي', ['public', 'friends', 'only_me']),
  _PrivacyField('whoCanFollow', 'من يمكنه متابعتي', ['public', 'friends', 'only_me']),
];

const _photoOptions = [
  ('public', 'عامة', 'يراها أي شخص'),
  ('matches_only', 'للمتوافقين فقط', 'تظهر بعد التوافق المتبادل أو الصداقة'),
  ('on_request', 'عند الطلب', 'تظهر فقط لمن وافقت على طلبه'),
  ('private', 'خاصة', 'لا تظهر لأحد'),
];

class PrivacySettingsScreen extends ConsumerStatefulWidget {
  const PrivacySettingsScreen({super.key});

  @override
  ConsumerState<PrivacySettingsScreen> createState() => _PrivacySettingsScreenState();
}

class _PrivacySettingsScreenState extends ConsumerState<PrivacySettingsScreen> {
  bool _exporting = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(privacyProvider.notifier).loadAll());
  }

  Future<void> _exportData() async {
    setState(() => _exporting = true);
    try {
      await ref.read(privacyUseCaseProvider).exportMyData();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تجهيز بياناتك (سيتم إرسالها إلى بريدك الإلكتروني قريباً)')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر تصدير البيانات')));
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  Future<void> _confirmUnblock(BlockedUser user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء حظر مستخدم'),
        content: Text('هل أنت متأكد من إلغاء حظر ${user.name}؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('تأكيد')),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(privacyProvider.notifier).unblockUser(user.blockedUserId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(privacyProvider);
    final settings = state.settings;

    return Scaffold(
      appBar: AppBar(title: const Text('الخصوصية')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(privacyProvider.notifier).loadAll(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (state.error != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(color: AppTheme.dangerColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                    ),
                  const _PhotoVisibilityCard(),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('إعدادات الخصوصية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 8),
                          ..._fields.map((field) => _buildDropdownRow(field, settings)),
                          const Divider(),
                          SwitchListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('السماح لمحركات البحث بالفهرسة'),
                            value: settings.allowSearchEngines,
                            onChanged: (v) => ref.read(privacyProvider.notifier).updateField('allowSearchEngines', v),
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
                          const Text('طلبات الوصول للصور', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 8),
                          if (state.photoRequests.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Text('لا توجد طلبات حالياً'),
                            )
                          else
                            ...state.photoRequests.map((r) => ListTile(
                                  contentPadding: EdgeInsets.zero,
                                  title: Text(r.requesterName),
                                  subtitle: r.requesterUsername != null ? Text('@${r.requesterUsername}') : null,
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.check, color: AppTheme.successColor),
                                        onPressed: () => ref.read(privacyProvider.notifier).respondToPhotoRequest(r.id, true),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.close, color: AppTheme.dangerColor),
                                        onPressed: () => ref.read(privacyProvider.notifier).respondToPhotoRequest(r.id, false),
                                      ),
                                    ],
                                  ),
                                )),
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
                          const Text('المستخدمون المحظورون', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 8),
                          if (state.blocks.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Text('لا يوجد مستخدمون محظورون'),
                            )
                          else
                            ...state.blocks.map((b) => ListTile(
                                  contentPadding: EdgeInsets.zero,
                                  title: Text(b.name),
                                  subtitle: Text('@${b.username}'),
                                  trailing: TextButton(
                                    onPressed: () => _confirmUnblock(b),
                                    child: const Text('إلغاء الحظر'),
                                  ),
                                )),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.download_outlined),
                      title: const Text('تصدير بياناتك'),
                      subtitle: const Text('احصل على نسخة من جميع بياناتك الشخصية'),
                      trailing: _exporting
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : OutlinedButton(onPressed: _exportData, child: const Text('تصدير')),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildDropdownRow(_PrivacyField field, PrivacySettings settings) {
    final currentValue = _fieldValue(field.key, settings);
    final value = field.options.contains(currentValue) ? currentValue : field.options.first;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(field.label)),
          DropdownButton<String>(
            value: value,
            items: field.options
                .map((o) => DropdownMenuItem(value: o, child: Text(_visibilityLabels[o] ?? o)))
                .toList(),
            onChanged: (v) {
              if (v != null) ref.read(privacyProvider.notifier).updateField(field.key, v);
            },
          ),
        ],
      ),
    );
  }

  String _fieldValue(String key, PrivacySettings s) {
    switch (key) {
      case 'whoCanSeePosts':
        return s.whoCanSeePosts;
      case 'whoCanSeeFriends':
        return s.whoCanSeeFriends;
      case 'whoCanSendFriendRequests':
        return s.whoCanSendFriendRequests;
      case 'whoCanSeeProfilePicture':
        return s.whoCanSeeProfilePicture;
      case 'whoCanSeeCoverPhoto':
        return s.whoCanSeeCoverPhoto;
      case 'whoCanSeeBio':
        return s.whoCanSeeBio;
      case 'whoCanTagMe':
        return s.whoCanTagMe;
      case 'whoCanSendMessages':
        return s.whoCanSendMessages;
      case 'whoCanFollow':
        return s.whoCanFollow;
      default:
        return 'friends';
    }
  }
}

// Photo visibility + incognito browsing -- these live on the Profile entity
// (PATCH /users/me), not the settings.controller.ts privacy endpoint, so
// they're wired through the existing profile update plumbing rather than
// duplicating it in the settings repository.
class _PhotoVisibilityCard extends ConsumerWidget {
  const _PhotoVisibilityCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);

    return profileAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (profile) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('خصوصية الصور', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              // Plain selectable ListTiles instead of RadioListTile/Radio --
              // those are deprecated in this Flutter SDK in favor of
              // RadioGroup, which isn't available yet at this project's
              // Flutter version.
              ..._photoOptions.map((o) {
                final selected = profile.photoVisibility == o.$1;
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                    color: selected ? AppTheme.accentColor : null,
                  ),
                  title: Text(o.$2),
                  subtitle: Text(o.$3, style: const TextStyle(fontSize: 12)),
                  onTap: () async {
                    await ref.read(updateProfileUseCaseProvider).call({'photoVisibility': o.$1});
                    ref.invalidate(myProfileProvider);
                  },
                );
              }),
              const Divider(),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('التصفّح المخفي'),
                subtitle: const Text('تصفّح الملفات دون ترك أثر "شاهد ملفك"', style: TextStyle(fontSize: 12)),
                value: profile.incognito,
                onChanged: (v) async {
                  await ref.read(updateProfileUseCaseProvider).call({'incognito': v});
                  ref.invalidate(myProfileProvider);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
