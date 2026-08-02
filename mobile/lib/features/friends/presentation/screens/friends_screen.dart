import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/friend_user.dart';
import '../../domain/entities/friend_request.dart';
import '../../domain/entities/friend_suggestion.dart';
import '../../domain/entities/friend_birthday.dart';
import '../../domain/entities/friend_list.dart';
import '../state/friends_state.dart';
import '../providers/friends_providers.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/chat/presentation/providers/chat_providers.dart';
import '../../../../features/chat/presentation/screens/chat_thread_screen.dart';
import '../../../../features/profile/presentation/screens/public_profile_screen.dart';

// Mirrors web/src/app/(main)/friends/page.tsx's four tabs (friends/requests/
// suggestions/lists) plus its birthdays strip (shown above the tab bar, only
// on the friends tab, matching web's `activeTab === 'friends' &&
// birthdays.length > 0` guard).
class FriendsScreen extends ConsumerStatefulWidget {
  const FriendsScreen({super.key});

  @override
  ConsumerState<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends ConsumerState<FriendsScreen> {
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(friendsProvider.notifier).loadAll());
  }

  void _openProfile(String userId, String name, String? avatarUrl) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => PublicProfileScreen(userId: userId, initialName: name, initialAvatarUrl: avatarUrl),
    ));
  }

  Future<void> _openChat(String userId) async {
    try {
      final conversation = await ref.read(getOrCreateConversationUseCaseProvider).call(userId);
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ChatThreadScreen(
          conversationId: conversation.id,
          title: conversation.displayName,
          otherUserId: conversation.otherUserId ?? userId,
          otherUserAvatar: conversation.otherUserAvatar,
        ),
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر فتح المحادثة')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(friendsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الأصدقاء')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<int>(
              segments: [
                ButtonSegment(value: 0, label: Text('الأصدقاء (${state.friends.length})')),
                ButtonSegment(value: 1, label: Text('الطلبات (${state.incomingRequests.length})')),
                ButtonSegment(value: 2, label: Text('اقتراحات (${state.suggestions.length})')),
                ButtonSegment(value: 3, label: Text('القوائم (${state.friendLists.length})')),
              ],
              selected: {_tabIndex},
              onSelectionChanged: (s) => setState(() => _tabIndex = s.first),
            ),
          ),
          if (_tabIndex == 0 && state.birthdays.isNotEmpty) _BirthdaysStrip(birthdays: state.birthdays),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
            ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => ref.read(friendsProvider.notifier).refresh(),
                    child: _buildTabBody(state),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBody(FriendsState state) {
    switch (_tabIndex) {
      case 1:
        return _buildRequestsList(state.incomingRequests, state.pendingIds);
      case 2:
        return _buildSuggestionsList(state.suggestions, state.pendingIds);
      case 3:
        return _ListsTab(friendLists: state.friendLists, friends: state.friends, listActionPending: state.listActionPending);
      default:
        return _buildFriendsList(state.friends);
    }
  }

  Widget _buildFriendsList(List<FriendUser> friends) {
    if (friends.isEmpty) {
      return const _EmptyState(icon: Icons.people_outline, message: 'لا يوجد أصدقاء بعد');
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: friends.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final f = friends[i];
        return Card(
          child: ListTile(
            leading: _Avatar(name: f.fullName, avatarUrl: f.avatarUrl),
            title: Text(f.fullName, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: f.bio != null && f.bio!.isNotEmpty ? Text(f.bio!, maxLines: 1, overflow: TextOverflow.ellipsis) : null,
            trailing: PopupMenuButton<String>(
              onSelected: (v) {
                if (v == 'message') _openChat(f.id);
                if (v == 'unfriend') ref.read(friendsProvider.notifier).unfriend(f.id);
                if (v == 'block') ref.read(friendsProvider.notifier).block(f.id);
              },
              itemBuilder: (context) => const [
                PopupMenuItem(value: 'message', child: Text('مراسلة')),
                PopupMenuItem(value: 'unfriend', child: Text('إلغاء الصداقة')),
                PopupMenuItem(value: 'block', child: Text('حظر')),
              ],
            ),
            // Tapping the card itself opens the profile (mirrors web's
            // FriendsTab, which links the whole card to the friend's
            // profile) -- messaging stays reachable via the popup menu.
            onTap: () => _openProfile(f.id, f.fullName, f.avatarUrl),
          ),
        );
      },
    );
  }

  Widget _buildRequestsList(List<FriendRequest> requests, Set<String> pendingIds) {
    if (requests.isEmpty) {
      return const _EmptyState(icon: Icons.inbox_outlined, message: 'لا توجد طلبات صداقة');
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: requests.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final r = requests[i];
        final busy = pendingIds.contains(r.id);
        return Card(
          child: ListTile(
            leading: _Avatar(name: r.user.fullName, avatarUrl: r.user.avatarUrl),
            title: Text(r.user.fullName, style: const TextStyle(fontWeight: FontWeight.w600)),
            onTap: () => _openProfile(r.user.id, r.user.fullName, r.user.avatarUrl),
            trailing: busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.check_circle, color: AppTheme.successColor),
                        onPressed: () => ref.read(friendsProvider.notifier).acceptRequest(r.id),
                      ),
                      IconButton(
                        icon: const Icon(Icons.cancel, color: AppTheme.dangerColor),
                        onPressed: () => ref.read(friendsProvider.notifier).declineRequest(r.id),
                      ),
                    ],
                  ),
          ),
        );
      },
    );
  }

  Widget _buildSuggestionsList(List<FriendSuggestion> suggestions, Set<String> pendingIds) {
    if (suggestions.isEmpty) {
      return const _EmptyState(icon: Icons.lightbulb_outline, message: 'لا توجد اقتراحات حالياً');
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: suggestions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final s = suggestions[i];
        final busy = pendingIds.contains(s.user.id);
        return Card(
          child: ListTile(
            leading: _Avatar(name: s.user.fullName, avatarUrl: s.user.avatarUrl),
            title: Text(s.user.fullName, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: s.mutual > 0 ? Text('${s.mutual} أصدقاء مشتركون') : null,
            onTap: () => _openProfile(s.user.id, s.user.fullName, s.user.avatarUrl),
            trailing: busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : TextButton(
                    onPressed: () => ref.read(friendsProvider.notifier).sendRequest(s.user.id),
                    child: const Text('إضافة'),
                  ),
          ),
        );
      },
    );
  }
}

class _Avatar extends StatelessWidget {
  final String name;
  final String? avatarUrl;
  const _Avatar({required this.name, this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    final url = resolveMediaUrl(avatarUrl);
    return CircleAvatar(
      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
      backgroundImage: url != null ? NetworkImage(url) : null,
      child: url == null ? Text(name.isNotEmpty ? name[0] : '?') : null,
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  const _EmptyState({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        const SizedBox(height: 80),
        Icon(icon, size: 48, color: AppTheme.textSecondary),
        const SizedBox(height: 12),
        Center(child: Text(message, style: const TextStyle(color: AppTheme.textSecondary))),
      ],
    );
  }
}

// Mirrors web's BirthdayCard strip -- amber-tinted, horizontally scrollable,
// shown only above the friends tab (never requests/suggestions/lists).
class _BirthdaysStrip extends StatelessWidget {
  final List<FriendBirthday> birthdays;
  const _BirthdaysStrip({required this.birthdays});

  String _dateText(FriendBirthday b) {
    if (b.daysUntil <= 0) return 'اليوم';
    if (b.daysUntil == 1) return 'غدًا';
    return 'خلال ${b.daysUntil} يوم';
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 96,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('أعياد ميلاد قادمة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            Expanded(
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: birthdays.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final b = birthdays[i];
                  return Container(
                    width: 160,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.warningColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.warningColor.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        _Avatar(name: b.name, avatarUrl: b.avatar),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(b.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                              Text(_dateText(b), style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                            ],
                          ),
                        ),
                        const Text('🎂'),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Mirrors web's Lists tab: create a named list, then edit (rename + toggle
// members) or delete it. Backend hydrates `members` only on GET
// /friends/lists (#260), so create/update always refetch the full list via
// FriendsNotifier rather than trusting the mutation response.
class _ListsTab extends ConsumerStatefulWidget {
  final List<FriendListEntity> friendLists;
  final List<FriendUser> friends;
  final bool listActionPending;
  const _ListsTab({required this.friendLists, required this.friends, required this.listActionPending});

  @override
  ConsumerState<_ListsTab> createState() => _ListsTabState();
}

class _ListsTabState extends ConsumerState<_ListsTab> {
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _create() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;
    ref.read(friendsProvider.notifier).createList(name);
    _nameController.clear();
  }

  void _confirmDelete(FriendListEntity list) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('حذف القائمة'),
        content: Text('هل أنت متأكد من حذف "${list.name}"؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogCtx).pop(), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              Navigator.of(dialogCtx).pop();
              ref.read(friendsProvider.notifier).deleteList(list.id);
            },
            child: const Text('حذف', style: TextStyle(color: AppTheme.dangerColor)),
          ),
        ],
      ),
    );
  }

  void _openEdit(FriendListEntity list) {
    showDialog(
      context: context,
      builder: (_) => _EditListDialog(list: list, friends: widget.friends),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _nameController,
                decoration: const InputDecoration(hintText: 'اسم قائمة جديدة'),
                onSubmitted: (_) => _create(),
              ),
            ),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: widget.listActionPending ? null : _create,
              child: const Text('إنشاء'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (widget.friendLists.isEmpty)
          const Padding(
            padding: EdgeInsets.only(top: 32),
            child: Center(child: Text('لم تقم بإنشاء قوائم أصدقاء بعد', style: TextStyle(color: AppTheme.textSecondary))),
          )
        else
          for (final list in widget.friendLists)
            _FriendListCard(list: list, onEdit: () => _openEdit(list), onDelete: () => _confirmDelete(list)),
      ],
    );
  }
}

class _FriendListCard extends StatelessWidget {
  final FriendListEntity list;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _FriendListCard({required this.list, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(list.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                IconButton(icon: const Icon(Icons.edit_outlined, size: 20), color: AppTheme.primaryColor, onPressed: onEdit),
                IconButton(icon: const Icon(Icons.delete_outline, size: 20), color: AppTheme.dangerColor, onPressed: onDelete),
              ],
            ),
            Text('${list.members.length} أعضاء', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            if (list.members.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  for (final m in list.members.take(5)) _Avatar(name: m.fullName, avatarUrl: m.avatarUrl),
                  if (list.members.length > 5)
                    CircleAvatar(
                      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                      child: Text('+${list.members.length - 5}', style: const TextStyle(fontSize: 11)),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EditListDialog extends ConsumerStatefulWidget {
  final FriendListEntity list;
  final List<FriendUser> friends;
  const _EditListDialog({required this.list, required this.friends});

  @override
  ConsumerState<_EditListDialog> createState() => _EditListDialogState();
}

class _EditListDialogState extends ConsumerState<_EditListDialog> {
  late final TextEditingController _nameController;
  late Set<String> _selectedMemberIds;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.list.name);
    _selectedMemberIds = widget.list.memberIds.toSet();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _toggle(String id) {
    setState(() {
      if (_selectedMemberIds.contains(id)) {
        _selectedMemberIds.remove(id);
      } else {
        _selectedMemberIds.add(id);
      }
    });
  }

  void _save() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;
    ref.read(friendsProvider.notifier).updateList(
          widget.list.id,
          name: name,
          memberIds: _selectedMemberIds.toList(),
        );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('تعديل القائمة'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'اسم القائمة'),
            ),
            const SizedBox(height: 12),
            Text('الأعضاء (${_selectedMemberIds.length} محدد)',
                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            SizedBox(
              height: 240,
              width: double.maxFinite,
              child: widget.friends.isEmpty
                  ? const Center(
                      child: Text('لا يوجد أصدقاء لإضافتهم', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView(
                      shrinkWrap: true,
                      children: [
                        for (final f in widget.friends)
                          CheckboxListTile(
                            dense: true,
                            value: _selectedMemberIds.contains(f.id),
                            onChanged: (_) => _toggle(f.id),
                            title: Text(f.fullName),
                          ),
                      ],
                    ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
        FilledButton(onPressed: _save, child: const Text('حفظ')),
      ],
    );
  }
}
