import '../../../../core/api/api_response.dart';
import '../entities/friend_user.dart';
import '../repositories/friends_repository.dart';

class GetFriendsUseCase {
  final FriendsRepository _repository;
  const GetFriendsUseCase(this._repository);

  Future<PaginatedResult<FriendUser>> call({int page = 1, int limit = 20}) {
    return _repository.getFriends(page: page, limit: limit);
  }
}
