import '../../domain/entities/friend_user.dart';
import '../../domain/entities/friend_request.dart';
import '../../domain/entities/friend_suggestion.dart';

class FriendsState {
  final List<FriendUser> friends;
  final List<FriendRequest> incomingRequests;
  final List<FriendSuggestion> suggestions;
  final bool isLoading;
  final String? error;
  // Per-item pending action ids so a single card can show a busy state
  // without blocking the rest of the list -- mirrors the web page's
  // per-suggestion adding/following local state.
  final Set<String> pendingIds;

  const FriendsState({
    this.friends = const [],
    this.incomingRequests = const [],
    this.suggestions = const [],
    this.isLoading = false,
    this.error,
    this.pendingIds = const {},
  });

  FriendsState copyWith({
    List<FriendUser>? friends,
    List<FriendRequest>? incomingRequests,
    List<FriendSuggestion>? suggestions,
    bool? isLoading,
    String? error,
    Set<String>? pendingIds,
  }) {
    return FriendsState(
      friends: friends ?? this.friends,
      incomingRequests: incomingRequests ?? this.incomingRequests,
      suggestions: suggestions ?? this.suggestions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      pendingIds: pendingIds ?? this.pendingIds,
    );
  }
}
