import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../entities/video.dart';
import '../entities/video_comment.dart';

abstract class VideosRepository {
  Future<PaginatedResult<Video>> getVideos({int page = 1, int limit = 20, bool? isReel});
  Future<PaginatedResult<Video>> getReels({int page = 1, int limit = 20});
  Future<PaginatedResult<Video>> getTrending({int page = 1, int limit = 20});
  Future<PaginatedResult<Video>> getRecommended({int page = 1, int limit = 20});
  Future<PaginatedResult<Video>> getFollowing({int page = 1, int limit = 20});
  Future<PaginatedResult<Video>> getContinueWatching({int page = 1, int limit = 20});
  Future<Video> getVideo(String videoId);

  Future<String> uploadMedia(XFile file);
  Future<Video> createVideo({
    required String title,
    String? description,
    required String url,
    String? thumbnail,
    int? duration,
    bool isReel = false,
  });
  Future<void> deleteVideo(String videoId);

  /// Returns the new liked state.
  Future<bool> toggleLike(String videoId, bool currentlyLiked);

  /// Returns the new reaction type, or null if the toggle removed it.
  Future<String?> reactToVideo(String videoId, String type);
  Future<VideoReactions> getReactions(String videoId);

  Future<List<VideoComment>> getComments(String videoId);
  Future<VideoComment> addComment(String videoId, String content);
  Future<VideoComment> updateComment(String videoId, String commentId, String content);
  Future<void> deleteComment(String videoId, String commentId);
}
