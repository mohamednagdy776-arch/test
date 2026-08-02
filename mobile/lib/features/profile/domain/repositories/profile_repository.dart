import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../entities/profile.dart';
import '../entities/public_profile.dart';
import '../entities/follow_summary.dart';
import '../entities/profile_media_item.dart';
import '../entities/report_reason.dart';
import '../entities/activity_log_entry.dart';
import '../../../friends/domain/entities/friend_user.dart';
import '../../../posts/domain/entities/post.dart';

abstract class ProfileRepository {
  Future<Profile> getMyProfile();
  Future<Profile> updateProfile(Map<String, dynamic> data);
  Future<Profile> getUserProfile(String userId);
  // XFile (not dart:io.File) -- must work on web too, not just mobile.
  Future<Profile> uploadAvatar(XFile file);

  // Public (other-user) profile view -- GET /users/:id, the real
  // authenticated in-app profile view mirroring web's ProfileView.tsx.
  Future<PublicProfile> getPublicProfile(String userId);
  Future<PaginatedResult<Post>> getUserPosts(String userId, {int page = 1, int limit = 10});
  Future<List<FriendUser>> getUserFriends(String userId, {int page = 1, int limit = 20});
  Future<List<ProfilePhotoItem>> getUserPhotos(String userId, {int page = 1, int limit = 20});
  Future<List<ProfileVideoItem>> getUserVideos(String userId, {int page = 1, int limit = 20});
  Future<FollowStatus> getFollowStatus(String userId);
  Future<FollowCounts> getFollowCounts(String userId);
  Future<void> reportUser(String userId, String reason, String? details);
  Future<List<ReportReason>> getReportReasons();

  // Only ever call this with the CURRENT user's own id -- the backend 403s
  // any other id (curl-verified live).
  Future<ActivityLogResult> getActivityLog(String userId, {String? year, String? type, int page = 1, int limit = 20});
}
