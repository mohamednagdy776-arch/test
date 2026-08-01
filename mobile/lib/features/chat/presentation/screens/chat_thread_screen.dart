import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/message.dart';
import '../providers/chat_providers.dart';
import '../state/chat_thread_notifier.dart';
import '../state/chat_thread_state.dart';
import '../widgets/image_lightbox_screen.dart';
import '../widgets/message_action_sheet.dart';
import '../widgets/translatable_message_body.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/friends/presentation/providers/friends_providers.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';
import '../../../calls/domain/entities/call_peer.dart';
import '../../../calls/presentation/providers/call_providers.dart';
import '../../../calls/presentation/util/call_permissions.dart';
import '../../../profile/presentation/screens/public_profile_screen.dart';

// Composer emoji picker (item 5) -- a static curated grid, same lightweight
// approach web/ChatWindow.tsx itself uses (its CHAT_EMOJIS constant), not a
// full picker package. No new dependency needed for this: Flutter renders
// emoji glyphs natively via the system font.
const _kComposerEmojis = [
  '😀', '😂', '😍', '😘', '😊', '😉',
  '😢', '😭', '😡', '😱', '🤔', '😴',
  '👍', '👎', '👏', '🙏', '💪', '✌️',
  '❤️', '💔', '🔥', '✨', '🎉', '💯',
];

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
  final Map<String, GlobalKey> _messageKeys = {};
  final ImagePicker _imagePicker = ImagePicker();

  String? _highlightedMessageId;
  Timer? _highlightTimer;
  bool _showEmojiPicker = false;
  bool _blocking = false;

  ChatThreadKey get _key => (conversationId: widget.conversationId, otherUserId: widget.otherUserId);

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(chatThreadProvider(_key).notifier).init());
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollController.dispose();
    _highlightTimer?.cancel();
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

  Future<void> _blockUser() async {
    final otherUserId = widget.otherUserId;
    if (otherUserId == null || _blocking) return;
    setState(() => _blocking = true);
    try {
      await ref.read(friendRelationsUseCaseProvider).block(otherUserId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حظر المستخدم')));
      Navigator.of(context).pop();
    } catch (_) {
      if (!mounted) return;
      setState(() => _blocking = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر حظر المستخدم')));
    }
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  GlobalKey _keyFor(String messageId) => _messageKeys.putIfAbsent(messageId, () => GlobalKey());

  // Tapping a reply-preview strip inside a bubble scrolls to and briefly
  // highlights the original message it quotes (item 2).
  void _jumpToMessage(String messageId) {
    final ctx = _messageKeys[messageId]?.currentContext;
    if (ctx == null) return; // not currently rendered (e.g. scrolled far away)
    Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 300), alignment: 0.5);
    setState(() => _highlightedMessageId = messageId);
    _highlightTimer?.cancel();
    _highlightTimer = Timer(const Duration(milliseconds: 1200), () {
      if (mounted) setState(() => _highlightedMessageId = null);
    });
  }

  Future<void> _pickAndSendImage(ChatThreadNotifier notifier) async {
    final picked = await _imagePicker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    await notifier.sendImage(picked);
  }

  void _openLightbox(String url) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => ImageLightboxScreen(imageUrl: url)));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatThreadProvider(_key));
    final notifier = ref.read(chatThreadProvider(_key).notifier);
    final myProfile = ref.watch(myProfileProvider).valueOrNull;
    final myUserId = myProfile?.userId;

    ref.listen(chatThreadProvider(_key), (_, __) => _scrollToBottom());

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
        // video icons in the thread header. The overflow menu adds
        // block-user (item 8), reusing Phase 11's friends block use case.
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
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'block') _blockUser();
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'block',
                      enabled: !_blocking,
                      child: Text(_blocking ? 'جارٍ الحظر…' : 'حظر المستخدم',
                          style: const TextStyle(color: AppTheme.dangerColor)),
                    ),
                  ],
                ),
              ],
      ),
      body: Column(
        children: [
          Expanded(child: _buildMessages(state, myUserId, notifier)),
          _buildStatusRow(state),
          if (state.replyTo != null) _buildReplyStrip(state.replyTo!, notifier),
          _buildComposer(notifier, state),
        ],
      ),
    );
  }

  Widget _buildStatusRow(ChatThreadState state) {
    if (state.otherIsTyping) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Align(alignment: Alignment.centerRight, child: Text('يكتب الآن...', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary))),
      );
    }
    // Online/offline presence (item 7) -- only meaningful for 1:1 threads.
    if (widget.otherUserId == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Align(
        alignment: Alignment.centerRight,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              state.isOtherOnline ? 'متصل' : 'غير متصل',
              style: TextStyle(
                fontSize: 12,
                color: state.isOtherOnline ? AppTheme.successColor : AppTheme.textSecondary,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              width: 7,
              height: 7,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: state.isOtherOnline ? AppTheme.successColor : AppTheme.textSecondary.withValues(alpha: 0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReplyStrip(Message replyTo, ChatThreadNotifier notifier) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: const BoxDecoration(
        color: Color(0xFFEDE6D3),
        border: Border(top: BorderSide(color: Color(0xFFE7DFC9))),
      ),
      child: Row(
        children: [
          const Icon(Icons.reply, size: 16, color: AppTheme.primaryColor),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('رد على رسالة', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                Text(
                  replyTo.isDeletedForEveryone
                      ? 'تم حذف الرسالة'
                      : (replyTo.type == 'image' ? '📷 صورة' : (replyTo.content.isEmpty ? 'رسالة' : replyTo.content)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 18),
            onPressed: () => notifier.setReplyTo(null),
          ),
        ],
      ),
    );
  }

  Widget _buildMessages(ChatThreadState state, String? myUserId, ChatThreadNotifier notifier) {
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
        final isOwn = message.senderId == myUserId;
        final replyMessage = message.replyToId != null
            ? state.messages.where((m) => m.id == message.replyToId).firstOrNull
            : null;
        return _MessageBubble(
          key: _keyFor(message.id),
          message: message,
          isOwn: isOwn,
          isHighlighted: _highlightedMessageId == message.id,
          replyPreview: replyMessage,
          isSeen: isOwn && state.otherSeenAt != null && !message.createdAt.isAfter(state.otherSeenAt!),
          onLongPress: () => showMessageActionSheet(
            context,
            onReact: (emoji) => notifier.react(message.id, emoji),
            onReply: () => notifier.setReplyTo(message),
            onDeleteForMe: isOwn ? () => notifier.deleteMessage(message.id, forEveryone: false) : null,
            onDeleteForEveryone: isOwn ? () => notifier.deleteMessage(message.id, forEveryone: true) : null,
          ),
          onReplyPreviewTap: message.replyToId != null ? () => _jumpToMessage(message.replyToId!) : null,
          onImageTap: (url) => _openLightbox(url),
        );
      },
    );
  }

  Widget _buildComposer(ChatThreadNotifier notifier, ChatThreadState state) {
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_showEmojiPicker) _buildEmojiPanel(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              children: [
                IconButton(
                  icon: state.isUploadingImage
                      ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.image_outlined, color: AppTheme.primaryColor),
                  tooltip: 'إرسال صورة',
                  onPressed: state.isUploadingImage ? null : () => _pickAndSendImage(notifier),
                ),
                IconButton(
                  icon: Icon(Icons.emoji_emotions_outlined,
                      color: _showEmojiPicker ? AppTheme.accentColor : AppTheme.primaryColor),
                  tooltip: 'إدراج إيموجي',
                  onPressed: () => setState(() => _showEmojiPicker = !_showEmojiPicker),
                ),
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
                  icon: state.isSending
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.send, color: AppTheme.primaryColor),
                  onPressed: state.isSending ? null : () => _send(notifier),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmojiPanel() {
    return Container(
      height: 180,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE7DFC9))),
      ),
      child: GridView.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 6),
        itemCount: _kComposerEmojis.length,
        itemBuilder: (context, index) {
          final emoji = _kComposerEmojis[index];
          return InkWell(
            onTap: () => _inputCtrl.text += emoji,
            child: Center(child: Text(emoji, style: const TextStyle(fontSize: 22))),
          );
        },
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
  final bool isHighlighted;
  final bool isSeen;
  final Message? replyPreview;
  final VoidCallback onLongPress;
  final VoidCallback? onReplyPreviewTap;
  final ValueChanged<String> onImageTap;

  const _MessageBubble({
    super.key,
    required this.message,
    required this.isOwn,
    required this.isHighlighted,
    required this.isSeen,
    required this.replyPreview,
    required this.onLongPress,
    required this.onReplyPreviewTap,
    required this.onImageTap,
  });

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
    final isDeleted = message.isDeletedForEveryone;
    final resolvedImageUrl = message.type == 'image' ? resolveMediaUrl(message.mediaUrl) : null;

    return Align(
      alignment: isOwn ? Alignment.centerLeft : Alignment.centerRight,
      child: GestureDetector(
        onLongPress: isDeleted ? null : onLongPress,
        child: Column(
          crossAxisAlignment: isOwn ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
              margin: const EdgeInsets.symmetric(vertical: 4),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                borderRadius: radius,
                gradient: isOwn && !isHighlighted
                    ? const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                      )
                    : null,
                color: isHighlighted
                    ? AppTheme.accentColor.withValues(alpha: 0.35)
                    : (isOwn ? null : const Color(0xFFEDE6D3)),
                border: isOwn ? null : Border.all(color: const Color(0xFFE7DFC9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (message.replyToId != null && !isDeleted)
                    InkWell(
                      onTap: onReplyPreviewTap,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: isOwn ? Colors.white.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(8),
                          border: Border(
                            right: BorderSide(color: isOwn ? Colors.white70 : AppTheme.primaryColor, width: 2),
                          ),
                        ),
                        child: Text(
                          replyPreview == null
                              ? 'رسالة محذوفة'
                              : replyPreview!.isDeletedForEveryone
                                  ? 'تم حذف الرسالة'
                                  : (replyPreview!.type == 'image' ? '📷 صورة' : replyPreview!.content),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            color: isOwn ? Colors.white.withValues(alpha: 0.85) : AppTheme.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  if (isDeleted)
                    Text(
                      'تم حذف الرسالة',
                      style: TextStyle(
                        fontStyle: FontStyle.italic,
                        fontSize: 12,
                        color: (isOwn ? Colors.white : AppTheme.textSecondary).withValues(alpha: 0.7),
                      ),
                    )
                  else if (resolvedImageUrl != null)
                    GestureDetector(
                      onTap: () => onImageTap(resolvedImageUrl),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.network(
                          resolvedImageUrl,
                          width: 200,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            width: 200,
                            height: 150,
                            color: Colors.black12,
                            child: const Icon(Icons.broken_image),
                          ),
                        ),
                      ),
                    )
                  else
                    TranslatableMessageBody(content: message.content, isOwn: isOwn),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _formatTime(message.createdAt),
                        style: TextStyle(
                          fontSize: 10,
                          color: (isOwn ? Colors.white : AppTheme.textSecondary).withValues(alpha: 0.7),
                        ),
                      ),
                      if (isOwn) ...[
                        const SizedBox(width: 4),
                        Text(
                          isSeen ? '✓✓' : '✓',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isSeen ? FontWeight.bold : FontWeight.normal,
                            color: Colors.white.withValues(alpha: isSeen ? 1 : 0.6),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            if (message.reactions.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Wrap(
                  spacing: 4,
                  children: message.reactions
                      .map((r) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceColor,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE7DFC9)),
                            ),
                            child: Text(r.emoji, style: const TextStyle(fontSize: 12)),
                          ))
                      .toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final local = time.toLocal();
    final hour = local.hour % 12 == 0 ? 12 : local.hour % 12;
    final minute = local.minute.toString().padLeft(2, '0');
    final period = local.hour >= 12 ? 'م' : 'ص';
    return '$hour:$minute $period';
  }
}
