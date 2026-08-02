import '../entities/friend_birthday.dart';
import '../entities/friend_list.dart';
import '../repositories/friends_repository.dart';

// Bundles the Lists-tab + birthdays-strip reads/writes, mirroring
// FriendRelationsUseCase's multi-method bundling style.
class FriendListsUseCase {
  final FriendsRepository _repository;
  const FriendListsUseCase(this._repository);

  Future<List<FriendBirthday>> birthdays() => _repository.getBirthdays();

  Future<List<FriendListEntity>> lists() => _repository.getFriendLists();

  Future<FriendListEntity> create(String name) => _repository.createFriendList(name);

  Future<FriendListEntity> update(String listId, {String? name, List<String>? memberIds}) =>
      _repository.updateFriendList(listId, name: name, memberIds: memberIds);

  Future<void> delete(String listId) => _repository.deleteFriendList(listId);
}
