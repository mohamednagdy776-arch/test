import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../domain/entities/message.dart';
import '../../domain/use_cases/chat_thread_use_case.dart';
import '../../../../core/socket/socket_client.dart';
import 'chat_thread_state.dart';

class ChatThreadNotifier extends StateNotifier<ChatThreadState> {
  final ChatThreadUseCase _useCase;
  final String conversationId;
  final String myUserId;
  // Null for group chats (no single "other" participant to track presence/
  // read-receipts for) -- mirrors ChatThreadScreen's existing otherUserId,
  // which is already nullable for the same reason.
  final String? otherUserId;
  // Injectable so tests can supply a mocked socket instead of hitting the
  // real SocketClient singleton.
  final Future<io.Socket> Function() _connectSocketFn;

  io.Socket? _socket;
  Timer? _typingResetTimer;
  bool _disposed = false;

  ChatThreadNotifier(
    this._useCase, {
    required this.conversationId,
    required this.myUserId,
    this.otherUserId,
    Future<io.Socket> Function()? connectSocket,
  })  : _connectSocketFn = connectSocket ?? SocketClient.connect,
        super(const ChatThreadState());

  Future<void> init() async {
    await _connectSocket();
    await loadInitial();
  }

  Future<void> _connectSocket() async {
    final socket = await _connectSocketFn();
    _socket = socket;
    socket.emit('joinConversation', {'conversationId': conversationId, 'userId': myUserId});

    socket.on('newMessage', _onSocketMessage);
    socket.on('userTyping', _onUserTyping);
    // Phase 22: reactions, presence, read receipts -- the gateway
    // (chat.gateway.ts) already emits all three; the base Phase 6 chat
    // feature just never subscribed to them.
    socket.on('reactionUpdated', _onReactionUpdated);
    socket.on('presence', _onPresence);
    socket.on('messageSeen', _onMessageSeen);

    if (otherUserId != null) {
      socket.emitWithAck('getPresence', {'userId': otherUserId}, ack: (dynamic res) {
        if (_disposed) return;
        if (res is Map && res['userId'] == otherUserId) {
          state = state.copyWith(isOtherOnline: res['online'] as bool? ?? false, error: state.error);
        }
      });
    }
  }

  void _onSocketMessage(dynamic data) {
    final payload = data as Map<String, dynamic>;
    if (payload['conversationId'] != conversationId) return;
    final message = Message.fromJson(payload);
    if (state.messages.any((m) => m.id == message.id)) return;
    state = state.copyWith(messages: [...state.messages, message], error: state.error);
    // Mirrors web/ChatWindow.tsx's newMessage handler: seeing a message from
    // the other participant while the thread is open immediately marks it
    // read (both the live socket receipt the peer sees as ✓✓, and the REST
    // call that clears the unread badge/counter, #63).
    if (message.senderId != myUserId) {
      _markSeen();
    }
  }

  void _onUserTyping(dynamic data) {
    final payload = data as Map<String, dynamic>;
    if (payload['conversationId'] != conversationId) return;
    if (payload['userId'] == myUserId) return;
    state = state.copyWith(otherIsTyping: payload['isTyping'] as bool? ?? false, error: state.error);
  }

  void _onPresence(dynamic data) {
    if (_disposed) return;
    final payload = data as Map<String, dynamic>;
    if (otherUserId == null || payload['userId'] != otherUserId) return;
    state = state.copyWith(isOtherOnline: payload['online'] as bool? ?? false, error: state.error);
  }

  void _onMessageSeen(dynamic data) {
    if (_disposed) return;
    final payload = data as Map<String, dynamic>;
    if (payload['conversationId'] != conversationId) return;
    if (otherUserId != null && payload['userId'] != otherUserId) return;
    final seenAt = payload['seenAt'] as String?;
    state = state.copyWith(
      otherSeenAt: seenAt != null ? DateTime.tryParse(seenAt) ?? DateTime.now() : DateTime.now(),
      error: state.error,
    );
  }

  /// One reaction per user per message (server-enforced upsert/toggle,
  /// curl-verified). Applies the peer's reaction change from the
  /// 'reactionUpdated' relay; our own taps are already applied optimistically
  /// by [react], so the echo of our own user id is ignored.
  void _onReactionUpdated(dynamic data) {
    if (_disposed) return;
    final payload = data as Map<String, dynamic>;
    final userId = payload['userId'] as String?;
    if (userId == null || userId == myUserId) return;
    final messageId = payload['messageId'] as String?;
    final index = state.messages.indexWhere((m) => m.id == messageId);
    if (index == -1) return;
    final message = state.messages[index];
    final others = message.reactions.where((r) => r.userId != userId).toList();
    final action = payload['action'] as String? ?? 'added';
    final emoji = payload['emoji'] as String?;
    final updated = action == 'removed' || emoji == null
        ? others
        : [...others, MessageReaction(emoji: emoji, userId: userId)];
    _replaceMessage(index, message.copyWith(reactions: updated));
  }

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // GET .../messages already returns oldest-first (ASC, page 1 = the
      // start of the conversation) -- confirmed against chat.service.ts's
      // getMessages AND how web/src/features/chat/components/ChatWindow.tsx
      // consumes it directly with no reverse. An earlier version of this
      // code assumed newest-first (the more common REST convention) and
      // reversed it, which would have rendered every thread upside down --
      // caught by live-checking against the real API instead of assuming.
      final (messages, otherLastReadAt) = await _useCase.getMessages(conversationId);
      // otherLastReadAt (the peer's persisted last-read timestamp, #319) was
      // being fetched and silently discarded here -- wiring it into
      // otherSeenAt means a re-opened, already-read thread shows ✓✓ ticks
      // immediately instead of only after a brand-new live 'messageSeen'
      // event (Phase 22, read receipts).
      state = state.copyWith(messages: messages, isLoading: false, otherSeenAt: otherLastReadAt);
      _markSeen();
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الرسائل');
    }
  }

  void _markSeen() {
    _socket?.emit('markSeen', {'conversationId': conversationId, 'userId': myUserId, 'messageId': null});
    unawaited(_useCase.markSeen(conversationId));
  }

  Future<void> send(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || state.isSending) return;
    final replyToId = state.replyTo?.id;
    state = state.copyWith(isSending: true, error: null);
    try {
      final saved = await _useCase.sendMessage(conversationId, trimmed, replyToId: replyToId);
      // POST /chat/messages doesn't echo replyToId back (curl-verified) --
      // reattach it from what we actually sent rather than trusting the
      // response, mirroring web/ChatWindow.tsx's optimistic-message handling.
      final message = Message(
        id: saved.id,
        content: saved.content,
        senderId: myUserId,
        type: saved.type,
        replyToId: replyToId,
        createdAt: saved.createdAt,
      );
      state = state.copyWith(messages: [...state.messages, message], isSending: false, clearReplyTo: true);
      // REST call is the source of truth for persistence; relay it over the
      // socket so other participants get it in real time (matches
      // web/src/features/chat/components/ChatWindow.tsx's sendMessage flow).
      _socket?.emit('relayMessage', {
        'conversationId': conversationId,
        'message': {
          'id': saved.id,
          'content': saved.content,
          'senderId': myUserId,
          'type': saved.type,
          'replyToId': replyToId,
          'createdAt': saved.createdAt.toIso8601String(),
        },
      });
      setTyping(false);
    } catch (_) {
      state = state.copyWith(isSending: false, error: 'تعذّر إرسال الرسالة');
    }
  }

  /// Picks up an already-picked image ([XFile] from image_picker) and sends
  /// it as an 'image' message: upload-then-create, same two-step flow as
  /// web's sendImageMessage / StoriesRepository.uploadMedia.
  Future<void> sendImage(XFile file) async {
    if (state.isUploadingImage) return;
    state = state.copyWith(isUploadingImage: true, error: null);
    try {
      final mediaUrl = await _useCase.uploadMedia(file);
      final saved = await _useCase.sendMessage(conversationId, '', type: 'image', mediaUrl: mediaUrl);
      final message = Message(
        id: saved.id,
        content: '',
        senderId: myUserId,
        type: 'image',
        mediaUrl: mediaUrl,
        createdAt: saved.createdAt,
      );
      state = state.copyWith(messages: [...state.messages, message], isUploadingImage: false);
      _socket?.emit('relayMessage', {
        'conversationId': conversationId,
        'message': {
          'id': saved.id,
          'content': '',
          'senderId': myUserId,
          'type': 'image',
          'mediaUrl': mediaUrl,
          'createdAt': saved.createdAt.toIso8601String(),
        },
      });
    } catch (_) {
      state = state.copyWith(isUploadingImage: false, error: 'تعذّر إرسال الصورة');
    }
  }

  /// Sets/clears the message the composer is currently quoting a reply to.
  void setReplyTo(Message? message) {
    state = message == null
        ? state.copyWith(clearReplyTo: true, error: state.error)
        : state.copyWith(replyTo: message, error: state.error);
  }

  /// One reaction per user (server-enforced): tapping the same emoji again
  /// removes it, a different emoji replaces it. Applies optimistically, then
  /// persists via REST and relays the server-confirmed action to peers.
  Future<void> react(String messageId, String emoji) async {
    final index = state.messages.indexWhere((m) => m.id == messageId);
    if (index == -1) return;
    final original = state.messages[index];
    final mine = original.reactions.where((r) => r.userId == myUserId);
    final isToggleOff = mine.isNotEmpty && mine.first.emoji == emoji;
    final others = original.reactions.where((r) => r.userId != myUserId).toList();
    final optimistic = isToggleOff ? others : [...others, MessageReaction(emoji: emoji, userId: myUserId)];
    _replaceMessage(index, original.copyWith(reactions: optimistic));
    try {
      final action = await _useCase.reactToMessage(messageId, emoji);
      _socket?.emit('addReaction', {
        'conversationId': conversationId,
        'messageId': messageId,
        'userId': myUserId,
        'emoji': emoji,
        'action': action,
      });
    } catch (_) {
      // Revert the optimistic update; the tap simply didn't take effect.
      final revertIndex = state.messages.indexWhere((m) => m.id == messageId);
      if (revertIndex != -1) _replaceMessage(revertIndex, original);
      state = state.copyWith(error: 'تعذّر إضافة التفاعل');
    }
  }

  /// [forEveryone]=true leaves a tombstone ("تم حذف الرسالة") -- curl-verified:
  /// the backend returns content:null + isDeletedForEveryone:true, the row
  /// stays in the list. [forEveryone]=false ("delete for me") is
  /// curl-verified to remove the message for BOTH participants server-side
  /// (chat.service.ts's plain soft-delete has no per-user scoping) -- a
  /// backend limitation this client can't fix; it still offers both options
  /// to match web/ChatWindow.tsx's UI, and only ever lets you do this from
  /// your own messages (enforced in the UI layer for "for everyone"; the
  /// backend itself also 403s a for-everyone delete of someone else's message).
  Future<void> deleteMessage(String messageId, {required bool forEveryone}) async {
    try {
      await _useCase.deleteMessage(messageId, forEveryone: forEveryone);
      if (forEveryone) {
        final index = state.messages.indexWhere((m) => m.id == messageId);
        if (index != -1) {
          _replaceMessage(index, state.messages[index].copyWith(isDeletedForEveryone: true, content: ''));
        }
      } else {
        state = state.copyWith(
          messages: state.messages.where((m) => m.id != messageId).toList(),
          error: state.error,
        );
      }
      if (state.replyTo?.id == messageId) {
        state = state.copyWith(clearReplyTo: true, error: state.error);
      }
    } catch (_) {
      state = state.copyWith(error: 'تعذّر حذف الرسالة');
    }
  }

  void _replaceMessage(int index, Message updated) {
    final updatedList = [...state.messages];
    updatedList[index] = updated;
    // Pure list mutation -- never touches the error field either way.
    state = state.copyWith(messages: updatedList, error: state.error);
  }

  void setTyping(bool isTyping) {
    _socket?.emit('typing', {'conversationId': conversationId, 'userId': myUserId, 'isTyping': isTyping});
    if (isTyping) {
      _typingResetTimer?.cancel();
      _typingResetTimer = Timer(const Duration(seconds: 3), () => setTyping(false));
    }
  }

  @override
  void dispose() {
    _disposed = true;
    _typingResetTimer?.cancel();
    _socket?.off('newMessage', _onSocketMessage);
    _socket?.off('userTyping', _onUserTyping);
    _socket?.off('reactionUpdated', _onReactionUpdated);
    _socket?.off('presence', _onPresence);
    _socket?.off('messageSeen', _onMessageSeen);
    _socket?.emit('leaveConversation', {'conversationId': conversationId});
    super.dispose();
  }
}
