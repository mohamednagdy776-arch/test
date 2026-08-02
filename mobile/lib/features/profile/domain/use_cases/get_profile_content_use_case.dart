import '../../../../core/api/api_response.dart';
import '../../../friends/domain/entities/friend_user.dart';
import '../../../posts/domain/entities/post.dart';
import '../entities/profile_media_item.dart';
import '../entities/activity_log_entry.dart';
import '../repositories/profile_repository.dart';

// Bundles the profile screen's tab-content reads (posts/friends/photos/
// videos), mirroring FriendRelationsUseCase's multi-method bundling style --
// each tab is lazily called only when selected (same reasoning as web's
// ProfileView.tsx renderTab(), which fires each tab's query on demand
// instead of instantiating every tab's request up front).
class GetProfileContentUseCase {
  final ProfileRepository _repository;
  const GetProfileContentUseCase(this._repository);

  Future<PaginatedResult<Post>> posts(String userId, {int page = 1, int limit = 10}) =>
      _repository.getUserPosts(userId, page: page, limit: limit);

  Future<List<FriendUser>> friends(String userId, {int page = 1, int limit = 20}) =>
      _repository.getUserFriends(userId, page: page, limit: limit);

  Future<List<ProfilePhotoItem>> photos(String userId, {int page = 1, int limit = 20}) =>
      _repository.getUserPhotos(userId, page: page, limit: limit);

  Future<List<ProfileVideoItem>> videos(String userId, {int page = 1, int limit = 20}) =>
      _repository.getUserVideos(userId, page: page, limit: limit);

  // Only ever call with the current user's own id -- see ActivityLogEntry's
  // doc comment (backend 403s for any other id).
  Future<ActivityLogResult> activity(String userId, {String? year, String? type}) =>
      _repository.getActivityLog(userId, year: year, type: type);
}
