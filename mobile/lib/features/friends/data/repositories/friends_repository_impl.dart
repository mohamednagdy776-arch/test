import '../../../../core/api/api_response.dart';
import '../../domain/entities/friend_user.dart';
import '../../domain/entities/friend_request.dart';
import '../../domain/entities/friend_suggestion.dart';
import '../../domain/entities/friendship_status.dart';
import '../../domain/entities/friend_birthday.dart';
import '../../domain/entities/friend_list.dart';
import '../../domain/repositories/friends_repository.dart';
import '../data_sources/friends_remote_data_source.dart';

class FriendsRepositoryImpl implements FriendsRepository {
  final FriendsRemoteDataSource _remoteDataSource;
  const FriendsRepositoryImpl(this._remoteDataSource);

  @override
  Future<PaginatedResult<FriendUser>> getFriends({int page = 1, int limit = 20}) async {
    final page0 = await _remoteDataSource.getFriends(page: page, limit: limit);
    return PaginatedResult(
      items: page0.items.map(FriendUser.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<List<FriendRequest>> getIncomingRequests() async {
    final data = await _remoteDataSource.getIncomingRequests();
    return data
        .map((e) => FriendRequest.fromJson(e as Map<String, dynamic>, incoming: true))
        .toList();
  }

  @override
  Future<List<FriendRequest>> getSentRequests() async {
    final data = await _remoteDataSource.getSentRequests();
    return data
        .map((e) => FriendRequest.fromJson(e as Map<String, dynamic>, incoming: false))
        .toList();
  }

  @override
  Future<List<FriendSuggestion>> getSuggestions({int limit = 10}) async {
    final data = await _remoteDataSource.getSuggestions(limit: limit);
    return data.map((e) => FriendSuggestion.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<FriendshipStatus> getStatus(String userId) async {
    final data = await _remoteDataSource.getStatus(userId);
    return FriendshipStatus.fromJson(data);
  }

  @override
  Future<void> sendRequest(String userId) => _remoteDataSource.sendRequest(userId);

  @override
  Future<void> acceptRequest(String requestId) => _remoteDataSource.acceptRequest(requestId);

  @override
  Future<void> declineRequest(String requestId) => _remoteDataSource.declineRequest(requestId);

  @override
  Future<void> cancelRequest(String requestId) => _remoteDataSource.cancelRequest(requestId);

  @override
  Future<void> unfriend(String userId) => _remoteDataSource.unfriend(userId);

  @override
  Future<void> follow(String userId) => _remoteDataSource.follow(userId);

  @override
  Future<void> unfollow(String userId) => _remoteDataSource.unfollow(userId);

  @override
  Future<void> block(String userId) => _remoteDataSource.block(userId);

  @override
  Future<void> unblock(String userId) => _remoteDataSource.unblock(userId);

  @override
  Future<List<FriendBirthday>> getBirthdays() async {
    final data = await _remoteDataSource.getBirthdays();
    return data.map((e) => FriendBirthday.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<FriendListEntity>> getFriendLists() async {
    final data = await _remoteDataSource.getFriendLists();
    return data.map((e) => FriendListEntity.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<FriendListEntity> createFriendList(String name) async {
    final data = await _remoteDataSource.createFriendList(name);
    return FriendListEntity.fromJson(data);
  }

  @override
  Future<FriendListEntity> updateFriendList(String listId, {String? name, List<String>? memberIds}) async {
    final data = await _remoteDataSource.updateFriendList(listId, name: name, memberIds: memberIds);
    return FriendListEntity.fromJson(data);
  }

  @override
  Future<void> deleteFriendList(String listId) => _remoteDataSource.deleteFriendList(listId);
}
