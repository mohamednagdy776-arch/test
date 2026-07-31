import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/profile.dart';
import '../../domain/entities/public_profile.dart';
import '../../domain/entities/follow_summary.dart';
import '../../domain/entities/profile_media_item.dart';
import '../../domain/entities/report_reason.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../../friends/domain/entities/friend_user.dart';
import '../../../posts/domain/entities/post.dart';
import '../data_sources/profile_remote_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource _remoteDataSource;

  ProfileRepositoryImpl(this._remoteDataSource);

  @override
  Future<Profile> getMyProfile() async {
    final data = await _remoteDataSource.getMyProfile();
    return Profile.fromJson(data);
  }

  @override
  Future<Profile> updateProfile(Map<String, dynamic> data) async {
    final result = await _remoteDataSource.updateProfile(data);
    return Profile.fromJson(result);
  }

  @override
  Future<Profile> getUserProfile(String userId) async {
    final data = await _remoteDataSource.getUserProfile(userId);
    return Profile.fromJson(data);
  }

  @override
  Future<Profile> uploadAvatar(XFile file) async {
    final data = await _remoteDataSource.uploadAvatar(file);
    return Profile.fromJson(data);
  }

  @override
  Future<PublicProfile> getPublicProfile(String userId) async {
    final data = await _remoteDataSource.getFullProfile(userId);
    return PublicProfile.fromJson(data);
  }

  @override
  Future<PaginatedResult<Post>> getUserPosts(String userId, {int page = 1, int limit = 10}) async {
    final page0 = await _remoteDataSource.getUserPosts(userId, page: page, limit: limit);
    return PaginatedResult<Post>(
      items: page0.items.map(Post.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<List<FriendUser>> getUserFriends(String userId, {int page = 1, int limit = 20}) async {
    final rows = await _remoteDataSource.getUserFriends(userId, page: page, limit: limit);
    return rows.map(FriendUser.fromJson).toList();
  }

  @override
  Future<List<ProfilePhotoItem>> getUserPhotos(String userId, {int page = 1, int limit = 20}) async {
    final rows = await _remoteDataSource.getUserPhotos(userId, page: page, limit: limit);
    return rows.map(ProfilePhotoItem.fromJson).whereType<ProfilePhotoItem>().toList();
  }

  @override
  Future<List<ProfileVideoItem>> getUserVideos(String userId, {int page = 1, int limit = 20}) async {
    final rows = await _remoteDataSource.getUserVideos(userId, page: page, limit: limit);
    return rows.map(ProfileVideoItem.fromJson).toList();
  }

  @override
  Future<FollowStatus> getFollowStatus(String userId) async {
    final data = await _remoteDataSource.getFollowStatus(userId);
    return FollowStatus.fromJson(data);
  }

  @override
  Future<FollowCounts> getFollowCounts(String userId) async {
    final data = await _remoteDataSource.getFollowCounts(userId);
    return FollowCounts.fromJson(data);
  }

  @override
  Future<void> reportUser(String userId, String reason, String? details) {
    return _remoteDataSource.reportUser(userId, reason, details);
  }

  @override
  Future<List<ReportReason>> getReportReasons() async {
    final rows = await _remoteDataSource.getReportReasons();
    return rows.map(ReportReason.fromJson).toList();
  }
}
