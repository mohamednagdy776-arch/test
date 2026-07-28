import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/friend_user.dart';
import '../../domain/entities/friend_request.dart';
import '../../domain/entities/friend_suggestion.dart';
import '../state/friends_state.dart';
import '../providers/friends_providers.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/chat/presentation/providers/chat_providers.dart';
import '../../../../features/chat/presentation/screens/chat_thread_screen.dart';

// Mirrors web/src/app/(main)/friends/page.tsx's three main tabs. The web page
// also has "Lists" (friend lists) and a birthdays strip -- both call
// out-of-scope `/friends/lists` and `/friends/birthdays` endpoints not in
// this phase's controller scope, so they're intentionally left out here.
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

  Future<void> _openChat(String userId) async {
    try {
      final conversation = await ref.read(getOrCreateConversationUseCaseProvider).call(userId);
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ChatThreadScreen(conversationId: conversation.id, title: conversation.displayName),
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
              ],
              selected: {_tabIndex},
              onSelectionChanged: (s) => setState(() => _tabIndex = s.first),
            ),
          ),
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
            onTap: () => _openChat(f.id),
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
