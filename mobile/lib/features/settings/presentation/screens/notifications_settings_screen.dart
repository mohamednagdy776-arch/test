import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/theme.dart';
import '../providers/settings_providers.dart';
import '../../domain/entities/notification_settings.dart';
import '../../../notifications/presentation/providers/notifications_providers.dart';

const _notificationLabels = {
  'likesNotifications': ('إشعارات الإعجابات', 'الإشعار عندما يعجب منشور لك'),
  'commentsNotifications': ('إشعارات التعليقات', 'الإشعار على تعليقات منشوراتك'),
  'friendRequestsNotifications': ('إشعارات طلبات الصداقة', 'الإشعار عند استلام طلب صداقة جديد'),
  'messagesNotifications': ('إشعارات الرسائل', 'الإشعار عند استلام رسالة جديدة'),
  'mentionsNotifications': ('إشعارات الإشارة', 'الإشعار عندما يذكرك شخص ما'),
};

const _newsletterLabels = {
  'weeklyDigest': ('الملخص الأسبوعي', 'تلقي ملخص أسبوعي بالنشاطات'),
  'newFeaturesUpdates': ('تحديثات الميزات الجديدة', 'الإشعار عند إضافة ميزات جديدة'),
  'promotionsOffers': ('العروض والخصومات', 'تلقي معلومات عن العروض الخاصة'),
  'eventsAndCommunities': ('الفعاليات والمجتمعات', 'الإشعار عن الفعاليات القادمة'),
  'securityAlerts': ('تنبيهات الأمان', 'الإشعار عند اكتشاف نشاط مشبوه'),
};

// Mirrors web's settings/notifications/page.tsx: the in-app notification
// toggles + master switch (settings/notifications) and the email newsletter
// toggles (settings/newsletter). ALSO embeds the mobile-only push-category
// preferences that Phase 7 already built (features/notifications'
// NotificationPreferences, reached previously only via a bottom sheet from
// the notifications bell) -- reused as-is here rather than duplicated, since
// this Settings screen is now the natural home for it and web has no
// equivalent (web only requests a generic browser Notification permission,
// no granular server-side push categories).
class NotificationsSettingsScreen extends ConsumerStatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  ConsumerState<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends ConsumerState<NotificationsSettingsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(notificationsSettingsProvider.notifier).loadAll());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsSettingsProvider);
    final notifier = ref.read(notificationsSettingsProvider.notifier);
    final n = state.notificationSettings;
    final news = state.newsletterSettings;

    return Scaffold(
      appBar: AppBar(title: const Text('الإشعارات')),
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
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('جميع الإشعارات', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('تفعيل/تعطيل جميع الإشعارات'),
                        value: n.notificationsEnabled,
                        onChanged: (v) => notifier.updateNotificationField('notificationsEnabled', v),
                      ),
                      const Divider(height: 1),
                      for (final entry in _notificationLabels.entries)
                        SwitchListTile(
                          title: Text(entry.value.$1),
                          subtitle: Text(entry.value.$2, style: const TextStyle(fontSize: 12)),
                          value: _notificationValue(n, entry.key),
                          onChanged: n.notificationsEnabled
                              ? (v) => notifier.updateNotificationField(entry.key, v)
                              : null,
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Card(
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('النشرة البريدية', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('تلقي التحديثات عبر البريد الإلكتروني'),
                        value: news.newsletterEnabled,
                        onChanged: (v) => notifier.updateNewsletterField('newsletterEnabled', v),
                      ),
                      if (news.newsletterEnabled) ...[
                        const Divider(height: 1),
                        for (final entry in _newsletterLabels.entries)
                          SwitchListTile(
                            title: Text(entry.value.$1),
                            subtitle: Text(entry.value.$2, style: const TextStyle(fontSize: 12)),
                            value: _newsletterValue(news, entry.key),
                            onChanged: (v) => notifier.updateNewsletterField(entry.key, v),
                          ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const _PushPreferencesCard(),
              ],
            ),
    );
  }

  bool _notificationValue(NotificationSettings n, String key) {
    switch (key) {
      case 'likesNotifications':
        return n.likesNotifications;
      case 'commentsNotifications':
        return n.commentsNotifications;
      case 'friendRequestsNotifications':
        return n.friendRequestsNotifications;
      case 'messagesNotifications':
        return n.messagesNotifications;
      case 'mentionsNotifications':
        return n.mentionsNotifications;
      default:
        return false;
    }
  }

  bool _newsletterValue(NewsletterSettings news, String key) {
    switch (key) {
      case 'weeklyDigest':
        return news.weeklyDigest;
      case 'newFeaturesUpdates':
        return news.newFeaturesUpdates;
      case 'promotionsOffers':
        return news.promotionsOffers;
      case 'eventsAndCommunities':
        return news.eventsAndCommunities;
      case 'securityAlerts':
        return news.securityAlerts;
      default:
        return false;
    }
  }
}

class _PushPreferencesCard extends ConsumerWidget {
  const _PushPreferencesCard();

  static const _labels = {
    'newMatch': 'توافقات جديدة',
    'newMessage': 'رسائل جديدة',
    'postReaction': 'تفاعلات المنشورات',
    'postComment': 'تعليقات المنشورات',
    'medicalResultReady': 'نتائج الفحص الطبي',
    'consentRequest': 'طلبات الموافقة',
    'subscriptionEvents': 'أحداث الاشتراك',
    'labResultSubmitted': 'نتائج المختبر',
    'systemAnnouncements': 'إعلانات النظام',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefsAsync = ref.watch(notificationPreferencesProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('فئات الإشعارات الفورية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            const Text('تحكّم بأنواع الإشعارات الفورية التي تصلك على هذا الجهاز', style: TextStyle(fontSize: 12)),
            prefsAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, __) => const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('تعذّر تحميل الإعدادات'),
              ),
              data: (prefs) {
                final values = prefs.toMap();
                return Column(
                  children: [
                    for (final entry in values.entries)
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(_labels[entry.key] ?? entry.key),
                        value: entry.value,
                        onChanged: (v) async {
                          await ref.read(notificationsUseCaseProvider).updatePreferences({entry.key: v});
                          ref.invalidate(notificationPreferencesProvider);
                        },
                      ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
