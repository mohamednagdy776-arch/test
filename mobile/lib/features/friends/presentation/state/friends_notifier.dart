import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_friends_use_case.dart';
import '../../domain/use_cases/get_friend_requests_use_case.dart';
import '../../domain/use_cases/respond_to_friend_request_use_case.dart';
import '../../domain/use_cases/friend_relations_use_case.dart';
import 'friends_state.dart';

class FriendsNotifier extends StateNotifier<FriendsState> {
  final GetFriendsUseCase _getFriends;
  final GetFriendRequestsUseCase _getRequests;
  final RespondToFriendRequestUseCase _respond;
  final FriendRelationsUseCase _relations;

  // No auto-load-on-construct -- callers trigger loadAll() from initState,
  // same lesson as MatchesNotifier/FeedNotifier.
  FriendsNotifier(this._getFriends, this._getRequests, this._respond, this._relations)
      : super(const FriendsState());

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final friendsPage = await _getFriends();
      final incoming = await _getRequests.incoming();
      final suggestions = await _getRequests.suggestions();
      state = state.copyWith(
        friends: friendsPage.items,
        incomingRequests: incoming,
        suggestions: suggestions,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الأصدقاء');
    }
  }

  Future<void> refresh() => loadAll();

  Future<void> sendRequest(String userId) => _withPending(userId, () => _respond.send(userId));

  Future<void> acceptRequest(String requestId) async {
    await _withPending(requestId, () => _respond.accept(requestId));
    state = state.copyWith(
      incomingRequests: state.incomingRequests.where((r) => r.id != requestId).toList(),
    );
    await loadFriends();
  }

  Future<void> declineRequest(String requestId) async {
    await _withPending(requestId, () => _respond.decline(requestId));
    state = state.copyWith(
      incomingRequests: state.incomingRequests.where((r) => r.id != requestId).toList(),
    );
  }

  Future<void> unfriend(String userId) async {
    final previous = state.friends;
    state = state.copyWith(friends: previous.where((f) => f.id != userId).toList());
    try {
      await _relations.unfriend(userId);
    } catch (_) {
      state = state.copyWith(friends: previous, error: 'تعذّر إلغاء الصداقة');
    }
  }

  Future<void> follow(String userId) => _withPending(userId, () => _relations.follow(userId));

  Future<void> block(String userId) async {
    await _withPending(userId, () => _relations.block(userId));
    state = state.copyWith(friends: state.friends.where((f) => f.id != userId).toList());
  }

  Future<void> loadFriends() async {
    try {
      final page = await _getFriends();
      state = state.copyWith(friends: page.items);
    } catch (_) {
      // Keep whatever was already loaded -- this is a background refresh.
    }
  }

  Future<void> _withPending(String id, Future<void> Function() action) async {
    state = state.copyWith(pendingIds: {...state.pendingIds, id});
    try {
      await action();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تنفيذ الإجراء');
    } finally {
      // copyWith's `error` param isn't a nullable-preserving sentinel (matches
      // every other state class here) -- pass state.error through explicitly
      // or this finally-block copyWith would silently wipe the error the
      // catch block just set.
      state = state.copyWith(
        error: state.error,
        pendingIds: state.pendingIds.where((e) => e != id).toSet(),
      );
    }
  }
}
