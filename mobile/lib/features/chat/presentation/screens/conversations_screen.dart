import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/conversation.dart';
import '../providers/chat_providers.dart';
import 'chat_thread_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/media.dart';

class ConversationsScreen extends ConsumerWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المحادثات')),
      body: conversationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const Center(child: Text('تعذّر تحميل المحادثات')),
        data: (conversations) {
          if (conversations.isEmpty) {
            return const Center(child: Text('لا توجد محادثات بعد'));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(conversationsProvider),
            child: ListView.separated(
              itemCount: conversations.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) => _ConversationTile(conversation: conversations[index]),
            ),
          );
        },
      ),
    );
  }
}

class _ConversationTile extends StatelessWidget {
  final Conversation conversation;
  const _ConversationTile({required this.conversation});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(conversation.displayAvatar);
    return ListTile(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ChatThreadScreen(
            conversationId: conversation.id,
            title: conversation.displayName,
            otherUserId: conversation.otherUserId,
            otherUserAvatar: conversation.otherUserAvatar,
          ),
        ),
      ),
      leading: CircleAvatar(
        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
        backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
        child: avatarUrl == null ? Text(conversation.displayName.isNotEmpty ? conversation.displayName[0] : '?') : null,
      ),
      title: Text(conversation.displayName, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(
        conversation.lastMessageContent ?? 'ابدأ المحادثة',
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (conversation.lastMessageAt != null)
            Text(conversation.lastMessageAt!.timeAgo, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          if (conversation.unreadCount > 0) ...[
            const SizedBox(height: 4),
            CircleAvatar(
              radius: 10,
              backgroundColor: AppTheme.accentColor,
              child: Text('${conversation.unreadCount}', style: const TextStyle(fontSize: 10, color: Colors.white)),
            ),
          ],
        ],
      ),
    );
  }
}
