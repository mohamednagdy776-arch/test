import '../../domain/entities/friend_user.dart';
import '../../domain/entities/friend_request.dart';
import '../../domain/entities/friend_suggestion.dart';
import '../../domain/entities/friend_birthday.dart';
import '../../domain/entities/friend_list.dart';

class FriendsState {
  final List<FriendUser> friends;
  final List<FriendRequest> incomingRequests;
  final List<FriendSuggestion> suggestions;
  final List<FriendBirthday> birthdays;
  final List<FriendListEntity> friendLists;
  final bool isLoading;
  // Busy state for the Lists tab's create/rename/delete actions -- these are
  // infrequent, low-cardinality operations (a handful of lists at most), so
  // one shared flag is enough, unlike pendingIds' per-item granularity below.
  final bool listActionPending;
  final String? error;
  // Per-item pending action ids so a single card can show a busy state
  // without blocking the rest of the list -- mirrors the web page's
  // per-suggestion adding/following local state.
  final Set<String> pendingIds;

  const FriendsState({
    this.friends = const [],
    this.incomingRequests = const [],
    this.suggestions = const [],
    this.birthdays = const [],
    this.friendLists = const [],
    this.isLoading = false,
    this.listActionPending = false,
    this.error,
    this.pendingIds = const {},
  });

  FriendsState copyWith({
    List<FriendUser>? friends,
    List<FriendRequest>? incomingRequests,
    List<FriendSuggestion>? suggestions,
    List<FriendBirthday>? birthdays,
    List<FriendListEntity>? friendLists,
    bool? isLoading,
    bool? listActionPending,
    String? error,
    Set<String>? pendingIds,
  }) {
    return FriendsState(
      friends: friends ?? this.friends,
      incomingRequests: incomingRequests ?? this.incomingRequests,
      suggestions: suggestions ?? this.suggestions,
      birthdays: birthdays ?? this.birthdays,
      friendLists: friendLists ?? this.friendLists,
      isLoading: isLoading ?? this.isLoading,
      listActionPending: listActionPending ?? this.listActionPending,
      error: error,
      pendingIds: pendingIds ?? this.pendingIds,
    );
  }
}
