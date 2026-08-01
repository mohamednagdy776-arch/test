import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/friends/domain/entities/friend_user.dart';
import 'package:tayyibt/features/friends/domain/entities/friend_request.dart';
import 'package:tayyibt/features/friends/domain/repositories/friends_repository.dart';
import 'package:tayyibt/features/friends/domain/use_cases/get_friends_use_case.dart';
import 'package:tayyibt/features/friends/domain/use_cases/get_friend_requests_use_case.dart';
import 'package:tayyibt/features/friends/domain/use_cases/respond_to_friend_request_use_case.dart';
import 'package:tayyibt/features/friends/domain/use_cases/friend_relations_use_case.dart';
import 'package:tayyibt/features/friends/presentation/state/friends_notifier.dart';

class MockFriendsRepository extends Mock implements FriendsRepository {}

FriendUser _user(String id) => FriendUser(id: id, fullName: 'User $id');

FriendRequest _request(String id, String userId) => FriendRequest(
      id: id,
      status: 'pending',
      createdAt: DateTime(2026, 1, 1),
      user: _user(userId),
    );

void main() {
  late MockFriendsRepository repository;
  late FriendsNotifier notifier;

  setUp(() {
    repository = MockFriendsRepository();
    notifier = FriendsNotifier(
      GetFriendsUseCase(repository),
      GetFriendRequestsUseCase(repository),
      RespondToFriendRequestUseCase(repository),
      FriendRelationsUseCase(repository),
    );
  });

  test('loadAll populates friends, incoming requests, and suggestions', () async {
    when(() => repository.getFriends(page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_user('1'), _user('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getIncomingRequests()).thenAnswer((_) async => [_request('r1', 'u3')]);
    when(() => repository.getSuggestions(limit: 10)).thenAnswer((_) async => []);

    await notifier.loadAll();

    expect(notifier.state.friends.map((f) => f.id), ['1', '2']);
    expect(notifier.state.incomingRequests.map((r) => r.id), ['r1']);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadAll sets an error when the repository throws', () async {
    when(() => repository.getFriends(page: 1, limit: 20)).thenThrow(Exception('network error'));

    await notifier.loadAll();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('acceptRequest removes the request and refreshes the friends list', () async {
    when(() => repository.acceptRequest('r1')).thenAnswer((_) async {});
    when(() => repository.getFriends(page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_user('u3')], total: 1, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getIncomingRequests()).thenAnswer((_) async => [_request('r1', 'u3')]);
    when(() => repository.getSuggestions(limit: 10)).thenAnswer((_) async => []);
    await notifier.loadAll();

    await notifier.acceptRequest('r1');

    expect(notifier.state.incomingRequests, isEmpty);
    expect(notifier.state.friends.map((f) => f.id), ['u3']);
    verify(() => repository.acceptRequest('r1')).called(1);
  });

  test('declineRequest removes the request from the list', () async {
    when(() => repository.getFriends(page: 1, limit: 20)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getIncomingRequests()).thenAnswer((_) async => [_request('r1', 'u3')]);
    when(() => repository.getSuggestions(limit: 10)).thenAnswer((_) async => []);
    await notifier.loadAll();
    when(() => repository.declineRequest('r1')).thenAnswer((_) async {});

    await notifier.declineRequest('r1');

    expect(notifier.state.incomingRequests, isEmpty);
    verify(() => repository.declineRequest('r1')).called(1);
  });

  test('unfriend optimistically removes the friend and restores on failure', () async {
    when(() => repository.getFriends(page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_user('1'), _user('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getIncomingRequests()).thenAnswer((_) async => []);
    when(() => repository.getSuggestions(limit: 10)).thenAnswer((_) async => []);
    await notifier.loadAll();
    when(() => repository.unfriend('1')).thenThrow(Exception('boom'));

    await notifier.unfriend('1');

    expect(notifier.state.friends.map((f) => f.id), ['1', '2']);
    expect(notifier.state.error, isNotNull);
  });

  test('sendRequest tracks a pending id while in flight and clears it after', () async {
    when(() => repository.sendRequest('u9')).thenAnswer((_) async {});

    final future = notifier.sendRequest('u9');
    expect(notifier.state.pendingIds, contains('u9'));
    await future;

    expect(notifier.state.pendingIds, isEmpty);
    verify(() => repository.sendRequest('u9')).called(1);
  });

  test('sendRequest sets an error and clears the pending id when the repository throws', () async {
    when(() => repository.sendRequest('u9')).thenThrow(Exception('boom'));

    await notifier.sendRequest('u9');

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.pendingIds, isEmpty);
  });

  test('block removes the user from the friends list', () async {
    when(() => repository.getFriends(page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_user('1'), _user('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getIncomingRequests()).thenAnswer((_) async => []);
    when(() => repository.getSuggestions(limit: 10)).thenAnswer((_) async => []);
    await notifier.loadAll();
    when(() => repository.block('1')).thenAnswer((_) async {});

    await notifier.block('1');

    expect(notifier.state.friends.map((f) => f.id), ['2']);
    verify(() => repository.block('1')).called(1);
  });
}
