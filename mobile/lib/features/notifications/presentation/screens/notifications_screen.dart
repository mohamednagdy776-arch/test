import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/notification.dart';
import '../providers/notifications_providers.dart';
import '../state/notifications_state.dart';
import '../../../../core/constants/routes.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';

const _typeIcons = <String, IconData>{
  'friend_request': Icons.person_add,
  'friend_accepted': Icons.check_circle,
  'like': Icons.favorite,
  'comment': Icons.chat_bubble,
  'share': Icons.share,
  'mention': Icons.campaign,
  'birthday': Icons.cake,
  'group_invite': Icons.groups,
  'event_invite': Icons.event,
  'photo_access_request': Icons.image,
  'family_invite': Icons.shield,
};

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

const _tabLabels = <NotificationTab, String>{
  NotificationTab.all: 'الكل',
  NotificationTab.unread: 'غير مقروء',
  NotificationTab.likes: 'إعجابات',
  NotificationTab.comments: 'تعليقات',
};

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(notificationsProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsProvider);
    final hasUnread = state.items.any((n) => !n.readStatus);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          if (hasUnread)
            TextButton(
              onPressed: () async {
                await ref.read(notificationsProvider.notifier).markAllRead();
                ref.invalidate(unreadCountProvider);
              },
              child: const Text('قراءة الكل'),
            ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => _showPreferencesSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          _TabBar(activeTab: state.activeTab),
          Expanded(child: _buildBody(state)),
        ],
      ),
    );
  }

  Widget _buildBody(NotificationsState state) {
    if (state.isLoading && state.items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.error != null && state.items.isEmpty) {
      return Center(child: Text(state.error!));
    }
    final filtered = state.filteredItems;
    if (filtered.isEmpty) {
      return const Center(child: Text('لا توجد إشعارات'));
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(notificationsProvider.notifier).load(),
      child: ListView.separated(
        itemCount: filtered.length + (state.hasMore ? 1 : 0),
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          if (index >= filtered.length) {
            return _LoadMoreButton(isLoadingMore: state.isLoadingMore);
          }
          return Dismissible(
            key: ValueKey(filtered[index].id),
            direction: DismissDirection.endToStart,
            background: Container(
              color: Colors.red.withValues(alpha: 0.85),
              alignment: Alignment.centerLeft,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: const Icon(Icons.delete_outline, color: Colors.white),
            ),
            onDismissed: (_) => ref.read(notificationsProvider.notifier).delete(filtered[index].id),
            child: _NotificationTile(notification: filtered[index]),
          );
        },
      ),
    );
  }

  void _showPreferencesSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _PreferencesSheet(),
    );
  }
}

class _TabBar extends ConsumerWidget {
  final NotificationTab activeTab;
  const _TabBar({required this.activeTab});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadAsync = ref.watch(unreadCountProvider);
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        children: NotificationTab.values.map((tab) {
          final isActive = tab == activeTab;
          final count = tab == NotificationTab.unread ? unreadAsync.valueOrNull ?? 0 : null;
          return Padding(
            padding: const EdgeInsets.only(left: 8),
            child: ChoiceChip(
              label: Text(count != null && count > 0 ? '${_tabLabels[tab]} ($count)' : _tabLabels[tab]!),
              selected: isActive,
              onSelected: (_) => ref.read(notificationsProvider.notifier).setTab(tab),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _LoadMoreButton extends ConsumerWidget {
  final bool isLoadingMore;
  const _LoadMoreButton({required this.isLoadingMore});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: isLoadingMore
            ? const CircularProgressIndicator()
            : TextButton(
                onPressed: () => ref.read(notificationsProvider.notifier).loadMore(),
                child: const Text('عرض المزيد'),
              ),
      ),
    );
  }
}

class _NotificationTile extends ConsumerWidget {
  final AppNotification notification;
  const _NotificationTile({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListTile(
      tileColor: notification.readStatus ? null : AppTheme.primaryColor.withValues(alpha: 0.05),
      leading: CircleAvatar(
        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
        child: Icon(_typeIcons[notification.type] ?? Icons.notifications, color: AppTheme.primaryColor, size: 20),
      ),
      title: Text(
        notification.message,
        style: TextStyle(fontWeight: notification.readStatus ? FontWeight.normal : FontWeight.w600),
      ),
      subtitle: Text(notification.createdAt.timeAgo),
      onTap: () async {
        await ref.read(notificationsProvider.notifier).markAsRead(notification.id);
        ref.invalidate(unreadCountProvider);
        if (notification.entityType == 'post' && context.mounted) {
          context.go(AppRoutes.dashboard);
        }
      },
    );
  }
}

class _PreferencesSheet extends ConsumerWidget {
  const _PreferencesSheet();

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

    return SafeArea(
      child: prefsAsync.when(
        loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
        error: (_, __) => const SizedBox(height: 200, child: Center(child: Text('تعذّر تحميل الإعدادات'))),
        data: (prefs) {
          final values = prefs.toMap();
          return ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.symmetric(vertical: 8),
            children: [
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: Text('إعدادات الإشعارات', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              ),
              for (final entry in values.entries)
                SwitchListTile(
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
    );
  }
}
