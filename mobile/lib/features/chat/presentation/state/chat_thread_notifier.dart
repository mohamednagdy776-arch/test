import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../domain/entities/message.dart';
import '../../domain/use_cases/chat_thread_use_case.dart';
import '../../../../core/socket/socket_client.dart';
import 'chat_thread_state.dart';

class ChatThreadNotifier extends StateNotifier<ChatThreadState> {
  final ChatThreadUseCase _useCase;
  final String conversationId;
  final String myUserId;
  // Injectable so tests can supply a mocked socket instead of hitting the
  // real SocketClient singleton.
  final Future<io.Socket> Function() _connectSocketFn;

  io.Socket? _socket;
  Timer? _typingResetTimer;

  ChatThreadNotifier(
    this._useCase, {
    required this.conversationId,
    required this.myUserId,
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
  }

  void _onSocketMessage(dynamic data) {
    final payload = data as Map<String, dynamic>;
    if (payload['conversationId'] != conversationId) return;
    final message = Message.fromJson(payload);
    if (state.messages.any((m) => m.id == message.id)) return;
    state = state.copyWith(messages: [...state.messages, message]);
  }

  void _onUserTyping(dynamic data) {
    final payload = data as Map<String, dynamic>;
    if (payload['conversationId'] != conversationId) return;
    if (payload['userId'] == myUserId) return;
    state = state.copyWith(otherIsTyping: payload['isTyping'] as bool? ?? false);
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
      final (messages, _) = await _useCase.getMessages(conversationId);
      state = state.copyWith(messages: messages, isLoading: false);
      unawaited(_useCase.markSeen(conversationId));
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الرسائل');
    }
  }

  Future<void> send(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || state.isSending) return;
    state = state.copyWith(isSending: true, error: null);
    try {
      final saved = await _useCase.sendMessage(conversationId, trimmed);
      state = state.copyWith(messages: [...state.messages, saved], isSending: false);
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
          'createdAt': saved.createdAt.toIso8601String(),
        },
      });
      setTyping(false);
    } catch (_) {
      state = state.copyWith(isSending: false, error: 'تعذّر إرسال الرسالة');
    }
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
    _typingResetTimer?.cancel();
    _socket?.off('newMessage', _onSocketMessage);
    _socket?.off('userTyping', _onUserTyping);
    _socket?.emit('leaveConversation', {'conversationId': conversationId});
    super.dispose();
  }
}
