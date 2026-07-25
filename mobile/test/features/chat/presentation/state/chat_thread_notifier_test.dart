import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:tayyibt/features/chat/domain/entities/message.dart';
import 'package:tayyibt/features/chat/domain/repositories/chat_repository.dart';
import 'package:tayyibt/features/chat/domain/use_cases/chat_thread_use_case.dart';
import 'package:tayyibt/features/chat/presentation/state/chat_thread_notifier.dart';

class MockChatRepository extends Mock implements ChatRepository {}

class MockSocket extends Mock implements io.Socket {}

Message _message(String id, {String senderId = 'other', String content = 'hi'}) {
  return Message(id: id, content: content, senderId: senderId, createdAt: DateTime(2026, 1, 1));
}

void main() {
  late MockChatRepository repository;
  late MockSocket socket;
  late ChatThreadNotifier notifier;
  void Function(dynamic)? newMessageHandler;

  setUp(() {
    repository = MockChatRepository();
    socket = MockSocket();
    newMessageHandler = null;

    when(() => socket.emit(any(), any())).thenReturn(null);
    when(() => socket.on(any(), any())).thenAnswer((invocation) {
      final event = invocation.positionalArguments[0] as String;
      final handler = invocation.positionalArguments[1] as void Function(dynamic);
      if (event == 'newMessage') newMessageHandler = handler;
    });
    when(() => socket.off(any(), any())).thenReturn(null);
    when(() => repository.markSeen(any())).thenAnswer((_) async {});

    notifier = ChatThreadNotifier(
      ChatThreadUseCase(repository),
      conversationId: 'c1',
      myUserId: 'me',
      connectSocket: () async => socket,
    );
  });

  test('init joins the conversation room and loads history', () async {
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer(
      (_) async => ([_message('1')], null),
    );

    await notifier.init();

    expect(notifier.state.messages.map((m) => m.id), ['1']);
    verify(() => socket.emit('joinConversation', {'conversationId': 'c1', 'userId': 'me'})).called(1);
  });

  test('receiving a newMessage socket event for this conversation appends it', () async {
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
    when(() => repository.getMessages('c1', page: 1, limit: 50)).thenAnswer((_) async => (<Message>[], null));
    when(() => repository.sendMessage('c1', 'hello')).thenThrow(Exception('network error'));

    await notifier.init();
    await notifier.send('hello');

    expect(notifier.state.messages, isEmpty);
    expect(notifier.state.error, isNotNull);
  });
}
