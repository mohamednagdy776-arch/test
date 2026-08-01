import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:tayyibt/features/chat/domain/entities/message.dart';
import 'package:tayyibt/features/chat/domain/repositories/chat_repository.dart';
import 'package:tayyibt/features/chat/domain/use_cases/chat_thread_use_case.dart';
import 'package:tayyibt/features/chat/presentation/state/chat_thread_notifier.dart';

class MockChatRepository extends Mock implements ChatRepository {}

class MockSocket extends Mock implements io.Socket {}

Message _message(String id, {String senderId = 'other', String content = 'hi', List<MessageReaction> reactions = const []}) {
  return Message(id: id, content: content, senderId: senderId, createdAt: DateTime(2026, 1, 1), reactions: reactions);
}

void main() {
  late MockChatRepository repository;
  late MockSocket socket;
  late ChatThreadNotifier notifier;
  void Function(dynamic)? newMessageHandler;
  void Function(dynamic)? reactionUpdatedHandler;
  void Function(dynamic)? presenceHandler;
  void Function(dynamic)? messageSeenHandler;
  Function? presenceAck;

  setUpAll(() {
    registerFallbackValue(XFile.fromData(Uint8List(0), name: 'fallback.jpg'));
  });

  setUp(() {
    repository = MockChatRepository();
    socket = MockSocket();
    newMessageHandler = null;
    reactionUpdatedHandler = null;
    presenceHandler = null;
    messageSeenHandler = null;
    presenceAck = null;

    when(() => socket.emit(any(), any())).thenReturn(null);
    when(() => socket.on(any(), any())).thenAnswer((invocation) {
      final event = invocation.positionalArguments[0] as String;
      final handler = invocation.positionalArguments[1] as void Function(dynamic);
      switch (event) {
        case 'newMessage':
          newMessageHandler = handler;
        case 'reactionUpdated':
          reactionUpdatedHandler = handler;
        case 'presence':
          presenceHandler = handler;
        case 'messageSeen':
          messageSeenHandler = handler;
      }
    });
    when(() => socket.off(any(), any())).thenReturn(null);
    when(() => socket.emitWithAck(any(), any(), ack: any(named: 'ack'))).thenAnswer((invocation) {
      presenceAck = invocation.namedArguments[#ack] as Function?;
    });
    when(() => repository.markSeen(any())).thenAnswer((_) async {});
  });

  ChatThreadNotifier buildNotifier({String? otherUserId}) {
    return ChatThreadNotifier(
      ChatThreadUseCase(repository),
      conversationId: 'c1',
      myUserId: 'me',
      otherUserId: otherUserId,
      connectSocket: () async => socket,
    );
  }

  test('init joins the conversation room and loads history', () async {
    notifier = buildNotifier();
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
      (_) async => ([_message('1')], null),
    );

    await notifier.init();

    expect(notifier.state.messages.map((m) => m.id), ['1']);
    verify(() => socket.emit('joinConversation', {'conversationId': 'c1', 'userId': 'me'})).called(1);
  });

  test('receiving a newMessage socket event for this conversation appends it', () async {
    notifier = buildNotifier();
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));

    await notifier.init();
    expect(newMessageHandler, isNotNull);

    newMessageHandler!({
      'id': 'm1',
      'conversationId': 'c1',
      'content': 'hello there',
      'senderId': 'other-user',
      'createdAt': '2026-01-01T00:00:00.000Z',
    });

    expect(notifier.state.messages, hasLength(1));
    expect(notifier.state.messages.first.content, 'hello there');
  });

  test('a newMessage event for a different conversation is ignored', () async {
    notifier = buildNotifier();
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));

    await notifier.init();
    newMessageHandler!({
      'id': 'm1',
      'conversationId': 'some-other-conversation',
      'content': 'hello there',
      'senderId': 'other-user',
      'createdAt': '2026-01-01T00:00:00.000Z',
    });

    expect(notifier.state.messages, isEmpty);
  });

  test('duplicate message ids (e.g. echo of the sender\'s own relay) are not appended twice', () async {
    notifier = buildNotifier();
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
      (_) async => ([_message('1')], null),
    );

    await notifier.init();
    newMessageHandler!({
      'id': '1',
      'conversationId': 'c1',
      'content': 'hi',
      'senderId': 'other',
      'createdAt': '2026-01-01T00:00:00.000Z',
    });

    expect(notifier.state.messages, hasLength(1));
  });

  test('send persists via REST then relays the saved message over the socket', () async {
    notifier = buildNotifier();
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));
    when(() => repository.sendMessage('c1', 'hello')).thenAnswer(
      (_) async => Message(id: 'm2', content: 'hello', senderId: 'me', createdAt: DateTime(2026, 1, 1)),
    );

    await notifier.init();
    await notifier.send('hello');

    expect(notifier.state.messages.map((m) => m.id), ['m2']);
    expect(notifier.state.isSending, isFalse);
    verify(() => socket.emit('relayMessage', any())).called(1);
  });

  test('send failure surfaces an error without adding a message', () async {
    notifier = buildNotifier();
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));
    when(() => repository.sendMessage('c1', 'hello')).thenThrow(Exception('network error'));

    await notifier.init();
    await notifier.send('hello');

    expect(notifier.state.messages, isEmpty);
    expect(notifier.state.error, isNotNull);
  });

  group('reply-to-message (Phase 22)', () {
    test('setReplyTo sets and clears the quoted message', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => ([_message('1')], null));
      await notifier.init();

      notifier.setReplyTo(notifier.state.messages.first);
      expect(notifier.state.replyTo?.id, '1');

      notifier.setReplyTo(null);
      expect(notifier.state.replyTo, isNull);
    });

    test('sending a reply reattaches replyToId locally (POST /chat/messages does not echo it back) and clears replyTo', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => ([_message('1')], null));
      await notifier.init();
      notifier.setReplyTo(notifier.state.messages.first);

      // Mirrors the live, curl-verified response shape: no replyToId field.
      when(() => repository.sendMessage('c1', 'sure', replyToId: '1')).thenAnswer(
        (_) async => Message(id: 'm2', content: 'sure', senderId: 'me', createdAt: DateTime(2026, 1, 1)),
      );

      await notifier.send('sure');

      final sent = notifier.state.messages.firstWhere((m) => m.id == 'm2');
      expect(sent.replyToId, '1');
      expect(notifier.state.replyTo, isNull);
    });
  });

  group('message reactions (Phase 22)', () {
    test('react() optimistically toggles the reaction and persists via REST + relays the server action', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => ([_message('1')], null));
      await notifier.init();

      when(() => repository.reactToMessage('1', '👍')).thenAnswer((_) async => 'added');

      await notifier.react('1', '👍');

      final reacted = notifier.state.messages.first;
      expect(reacted.reactions, hasLength(1));
      expect(reacted.reactions.first.emoji, '👍');
      expect(reacted.reactions.first.userId, 'me');
      verify(() => socket.emit('addReaction', any(that: containsPair('action', 'added')))).called(1);
    });

    test('react() with the same emoji again toggles it off (one reaction per user)', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
        (_) async => ([_message('1', reactions: const [MessageReaction(emoji: '👍', userId: 'me')])], null),
      );
      await notifier.init();

      when(() => repository.reactToMessage('1', '👍')).thenAnswer((_) async => 'removed');

      await notifier.react('1', '👍');

      expect(notifier.state.messages.first.reactions, isEmpty);
    });

    test('a reactionUpdated event from another user updates that message; an echo of our own id is ignored', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => ([_message('1')], null));
      await notifier.init();
      expect(reactionUpdatedHandler, isNotNull);

      // Echo of our own reaction -- already applied optimistically, must be ignored.
      reactionUpdatedHandler!({'messageId': '1', 'userId': 'me', 'emoji': '🔥', 'action': 'added'});
      expect(notifier.state.messages.first.reactions, isEmpty);

      // A peer's reaction arrives live.
      reactionUpdatedHandler!({'messageId': '1', 'userId': 'peer', 'emoji': '❤️', 'action': 'added'});
      expect(notifier.state.messages.first.reactions.map((r) => r.emoji), ['❤️']);
    });
  });

  group('delete-for-me / delete-for-everyone (Phase 22)', () {
    test('deleteMessage(forEveryone: true) tombstones the message locally instead of removing it', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
        (_) async => ([_message('1', senderId: 'me', content: 'secret')], null),
      );
      await notifier.init();
      when(() => repository.deleteMessage('1', forEveryone: true)).thenAnswer((_) async {});

      await notifier.deleteMessage('1', forEveryone: true);

      expect(notifier.state.messages, hasLength(1));
      expect(notifier.state.messages.first.isDeletedForEveryone, isTrue);
      expect(notifier.state.messages.first.content, isEmpty);
    });

    test('deleteMessage(forEveryone: false) removes the message from local state entirely', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
        (_) async => ([_message('1', senderId: 'me')], null),
      );
      await notifier.init();
      when(() => repository.deleteMessage('1', forEveryone: false)).thenAnswer((_) async {});

      await notifier.deleteMessage('1', forEveryone: false);

      expect(notifier.state.messages, isEmpty);
    });

    test('a failed delete surfaces an error and leaves the message untouched', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
        (_) async => ([_message('1', senderId: 'me')], null),
      );
      await notifier.init();
      when(() => repository.deleteMessage('1', forEveryone: true)).thenThrow(Exception('forbidden'));

      await notifier.deleteMessage('1', forEveryone: true);

      expect(notifier.state.messages, hasLength(1));
      expect(notifier.state.messages.first.isDeletedForEveryone, isFalse);
      expect(notifier.state.error, isNotNull);
    });
  });

  group('presence + read receipts (Phase 22)', () {
    test('init asks for the other participant\'s presence and applies the ack response', () async {
      notifier = buildNotifier(otherUserId: 'peer');
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));

      await notifier.init();
      expect(presenceAck, isNotNull);
      presenceAck!({'userId': 'peer', 'online': true});

      expect(notifier.state.isOtherOnline, isTrue);
    });

    test('a presence event for a different user id is ignored', () async {
      notifier = buildNotifier(otherUserId: 'peer');
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));
      await notifier.init();

      presenceHandler!({'userId': 'someone-else', 'online': true});
      expect(notifier.state.isOtherOnline, isFalse);

      presenceHandler!({'userId': 'peer', 'online': true});
      expect(notifier.state.isOtherOnline, isTrue);
    });

    test('a messageSeen event from the tracked peer updates otherSeenAt (drives the ✓✓ tick)', () async {
      notifier = buildNotifier(otherUserId: 'peer');
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));
      await notifier.init();

      messageSeenHandler!({
        'conversationId': 'c1',
        'userId': 'peer',
        'seenAt': '2026-01-02T00:00:00.000Z',
      });

      expect(notifier.state.otherSeenAt, DateTime.parse('2026-01-02T00:00:00.000Z'));
    });

    test('loadInitial seeds otherSeenAt from the persisted otherLastReadAt (#319 parity)', () async {
      notifier = buildNotifier(otherUserId: 'peer');
      final persistedReadAt = DateTime.parse('2026-01-01T12:00:00.000Z');
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
        (_) async => (<Message>[], persistedReadAt),
      );

      await notifier.init();

      expect(notifier.state.otherSeenAt, persistedReadAt);
    });
  });

  group('image messages (Phase 22)', () {
    test('sendImage uploads then sends an image message and relays it', () async {
      notifier = buildNotifier();
      when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));
      await notifier.init();

      when(() => repository.uploadMedia(any())).thenAnswer((_) async => '/api/v1/media/posts/x.jpg');
      when(() => repository.sendMessage('c1', '', type: 'image', mediaUrl: '/api/v1/media/posts/x.jpg')).thenAnswer(
        (_) async => Message(id: 'm3', content: '', senderId: 'me', type: 'image', createdAt: DateTime(2026, 1, 1)),
      );

      await notifier.sendImage(XFile.fromData(Uint8List.fromList([1, 2, 3]), name: 'x.jpg'));

      expect(notifier.state.messages, hasLength(1));
      expect(notifier.state.messages.first.type, 'image');
      expect(notifier.state.messages.first.mediaUrl, '/api/v1/media/posts/x.jpg');
      expect(notifier.state.isUploadingImage, isFalse);
      verify(() => socket.emit('relayMessage', any())).called(1);
    });
  });
}
