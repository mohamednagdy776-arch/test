import '../../../../core/api/api_response.dart';
import '../entities/friend_user.dart';
import '../entities/friend_request.dart';
import '../entities/friend_suggestion.dart';
import '../entities/friendship_status.dart';
import '../entities/friend_birthday.dart';
import '../entities/friend_list.dart';

abstract class FriendsRepository {
  Future<PaginatedResult<FriendUser>> getFriends({int page = 1, int limit = 20});
  Future<List<FriendRequest>> getIncomingRequests();
  Future<List<FriendRequest>> getSentRequests();
  Future<List<FriendSuggestion>> getSuggestions({int limit = 10});
  Future<FriendshipStatus> getStatus(String userId);

  Future<void> sendRequest(String userId);
  Future<void> acceptRequest(String requestId);
  Future<void> declineRequest(String requestId);
  Future<void> cancelRequest(String requestId);

  Future<void> unfriend(String userId);
  Future<void> follow(String userId);
  Future<void> unfollow(String userId);
  Future<void> block(String userId);
  Future<void> unblock(String userId);

  Future<List<FriendBirthday>> getBirthdays();
  Future<List<FriendListEntity>> getFriendLists();
  Future<FriendListEntity> createFriendList(String name);
  Future<FriendListEntity> updateFriendList(String listId, {String? name, List<String>? memberIds});
  Future<void> deleteFriendList(String listId);
}
