import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/message.dart';
import '../providers/chat_providers.dart';
import '../state/chat_thread_notifier.dart';
import '../state/chat_thread_state.dart';
import '../../../../core/constants/theme.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';

class ChatThreadScreen extends ConsumerStatefulWidget {
  final String conversationId;
  final String title;
  const ChatThreadScreen({super.key, required this.conversationId, required this.title});

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
    final myUserId = ref.watch(myProfileProvider).valueOrNull?.userId;

    ref.listen(chatThreadProvider(widget.conversationId), (_, __) => _scrollToBottom());

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
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
