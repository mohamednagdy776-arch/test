import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/message.dart';
import '../providers/chat_providers.dart';
import '../state/chat_thread_notifier.dart';
import '../state/chat_thread_state.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';
import '../../../calls/domain/entities/call_peer.dart';
import '../../../calls/presentation/providers/call_providers.dart';
import '../../../calls/presentation/util/call_permissions.dart';
import '../../../profile/presentation/screens/public_profile_screen.dart';

class ChatThreadScreen extends ConsumerStatefulWidget {
  final String conversationId;
  final String title;
  // Needed to start a call from this thread (call:initiate's calleeId) --
  // null for group chats, where 1:1 calling doesn't apply.
  final String? otherUserId;
  final String? otherUserAvatar;
  const ChatThreadScreen({
    super.key,
    required this.conversationId,
    required this.title,
    this.otherUserId,
    this.otherUserAvatar,
  });

  @override
  ConsumerState<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends ConsumerState<ChatThreadScreen> {
  final _inputCtrl = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(chatThreadProvider(widget.conversationId).notifier).init());
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _startCall(CallType type, String? myName, String? myAvatar) async {
    final calleeId = widget.otherUserId;
    if (calleeId == null) return;
    final granted = await requestCallPermissions(type);
    if (!granted) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('يجب السماح بالوصول إلى الميكروفون لإجراء المكالمة')),
        );
      }
      return;
    }
    await ref.read(callNotifierProvider.notifier).startCall(
          conversationId: widget.conversationId,
          calleeId: calleeId,
          peerName: widget.title,
          peerAvatar: widget.otherUserAvatar,
          myName: myName,
          myAvatar: myAvatar,
          callType: type,
        );
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatThreadProvider(widget.conversationId));
    final notifier = ref.read(chatThreadProvider(widget.conversationId).notifier);
    final myProfile = ref.watch(myProfileProvider).valueOrNull;
    final myUserId = myProfile?.userId;

    ref.listen(chatThreadProvider(widget.conversationId), (_, __) => _scrollToBottom());

    return Scaffold(
      appBar: AppBar(
        // Tapping the thread title/avatar opens the other user's full
        // profile (mirrors web's ChatWindow.tsx header, which links the
        // peer's name to their profile) -- group chats (otherUserId null)
        // have no single "other user" to link to, so stay plain text there.
        title: widget.otherUserId == null
            ? Text(widget.title)
            : InkWell(
                onTap: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => PublicProfileScreen(
                    userId: widget.otherUserId!,
                    initialName: widget.title,
                    initialAvatarUrl: widget.otherUserAvatar,
                  ),
                )),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                      backgroundImage: resolveMediaUrl(widget.otherUserAvatar) != null
                          ? NetworkImage(resolveMediaUrl(widget.otherUserAvatar)!)
                          : null,
                      child: resolveMediaUrl(widget.otherUserAvatar) == null
                          ? Text(widget.title.isNotEmpty ? widget.title[0] : '؟', style: const TextStyle(fontSize: 13))
                          : null,
                    ),
                    const SizedBox(width: 8),
                    Flexible(child: Text(widget.title, overflow: TextOverflow.ellipsis)),
                  ],
                ),
              ),
        // Call entry points -- matches web's ChatWindow.tsx placing voice +
        // video icons in the thread header.
        actions: widget.otherUserId == null
            ? null
            : [
                IconButton(
                  icon: const Icon(Icons.call),
                  tooltip: 'مكالمة صوتية',
                  onPressed: () => _startCall(CallType.audio, myProfile?.fullName, myProfile?.avatarUrl),
                ),
                IconButton(
                  icon: const Icon(Icons.videocam),
                  tooltip: 'مكالمة فيديو',
                  onPressed: () => _startCall(CallType.video, myProfile?.fullName, myProfile?.avatarUrl),
                ),
              ],
      ),
      body: Column(
        children: [
          Expanded(child: _buildMessages(state, myUserId)),
          if (state.otherIsTyping)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Align(alignment: Alignment.centerRight, child: Text('يكتب الآن...', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary))),
            ),
          _buildComposer(notifier, state.isSending),
        ],
      ),
    );
  }

  Widget _buildMessages(ChatThreadState state, String? myUserId) {
    if (state.isLoading && state.messages.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.error != null && state.messages.isEmpty) {
      return Center(child: Text(state.error!));
    }
    if (state.messages.isEmpty) {
      return const Center(child: Text('لا توجد رسائل بعد، ابدأ المحادثة'));
    }
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(12),
      itemCount: state.messages.length,
      itemBuilder: (context, index) {
        final message = state.messages[index];
        return _MessageBubble(message: message, isOwn: message.senderId == myUserId);
      },
    );
  }

  Widget _buildComposer(ChatThreadNotifier notifier, bool isSending) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _inputCtrl,
                decoration: const InputDecoration(hintText: 'اكتب رسالة...', border: InputBorder.none),
                onChanged: (v) => notifier.setTyping(v.isNotEmpty),
                onSubmitted: (v) => _send(notifier),
                textInputAction: TextInputAction.send,
              ),
            ),
            IconButton(
              icon: isSending
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.send, color: AppTheme.primaryColor),
              onPressed: isSending ? null : () => _send(notifier),
            ),
          ],
        ),
      ),
    );
  }

  void _send(ChatThreadNotifier notifier) {
    final text = _inputCtrl.text;
    if (text.trim().isEmpty) return;
    _inputCtrl.clear();
    notifier.send(text);
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  final bool isOwn;
  const _MessageBubble({required this.message, required this.isOwn});

  @override
  Widget build(BuildContext context) {
    // Own bubbles: primary->secondary gradient, white text, sharp top-left
    // corner. Others: muted background + border, sharp top-right corner.
    // Matches web/src/features/chat/components/ChatWindow.tsx's bubble
    // styling exactly (verified against source, not guessed).
    final radius = isOwn
        ? const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(16),
            bottomRight: Radius.circular(16),
          )
        : const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(4),
            bottomLeft: Radius.circular(16),
            bottomRight: Radius.circular(16),
          );

    return Align(
      alignment: isOwn ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: radius,
          gradient: isOwn
              ? const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                )
              : null,
          color: isOwn ? null : const Color(0xFFEDE6D3),
          border: isOwn ? null : Border.all(color: const Color(0xFFE7DFC9)),
        ),
        child: Text(
          message.content,
          style: TextStyle(color: isOwn ? Colors.white : AppTheme.foregroundColor),
        ),
      ),
    );
  }
}
