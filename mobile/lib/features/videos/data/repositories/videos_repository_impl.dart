import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/video.dart';
import '../../domain/entities/video_comment.dart';
import '../../domain/repositories/videos_repository.dart';
import '../data_sources/videos_remote_data_source.dart';

class VideosRepositoryImpl implements VideosRepository {
  final VideosRemoteDataSource _remoteDataSource;
  const VideosRepositoryImpl(this._remoteDataSource);

  PaginatedResult<Video> _mapPage(PaginatedResult<Map<String, dynamic>> page) {
    return PaginatedResult<Video>(
      items: page.items.map(Video.fromJson).toList(),
      total: page.total,
      page: page.page,
      limit: page.limit,
      totalPages: page.totalPages,
    );
  }

  @override
  Future<PaginatedResult<Video>> getVideos({int page = 1, int limit = 20, bool? isReel}) async {
    return _mapPage(await _remoteDataSource.getVideos(page: page, limit: limit, isReel: isReel));
  }

  @override
  Future<PaginatedResult<Video>> getReels({int page = 1, int limit = 20}) async {
    return _mapPage(await _remoteDataSource.getReels(page: page, limit: limit));
  }

  @override
  Future<PaginatedResult<Video>> getTrending({int page = 1, int limit = 20}) async {
    return _mapPage(await _remoteDataSource.getTrending(page: page, limit: limit));
  }

  @override
  Future<PaginatedResult<Video>> getRecommended({int page = 1, int limit = 20}) async {
    return _mapPage(await _remoteDataSource.getRecommended(page: page, limit: limit));
  }

  @override
  Future<PaginatedResult<Video>> getFollowing({int page = 1, int limit = 20}) async {
    return _mapPage(await _remoteDataSource.getFollowing(page: page, limit: limit));
  }

  @override
  Future<PaginatedResult<Video>> getContinueWatching({int page = 1, int limit = 20}) async {
    return _mapPage(await _remoteDataSource.getContinueWatching(page: page, limit: limit));
  }

  @override
  Future<Video> getVideo(String videoId) async {
    return Video.fromJson(await _remoteDataSource.getVideo(videoId));
  }

  @override
  Future<String> uploadMedia(XFile file) => _remoteDataSource.uploadMedia(file);

  @override
  Future<Video> createVideo({
    required String title,
    String? description,
    required String url,
    String? thumbnail,
    int? duration,
    bool isReel = false,
  }) async {
    final data = await _remoteDataSource.createVideo(
      title: title,
      description: description,
      url: url,
      thumbnail: thumbnail,
      duration: duration,
      isReel: isReel,
    );
    return Video.fromJson(data);
  }

  @override
  Future<void> deleteVideo(String videoId) => _remoteDataSource.deleteVideo(videoId);

  @override
  Future<bool> toggleLike(String videoId, bool currentlyLiked) async {
    final data = currentlyLiked
        ? await _remoteDataSource.unlikeVideo(videoId)
        : await _remoteDataSource.likeVideo(videoId);
    return data['isLiked'] as bool? ?? !currentlyLiked;
  }

  @override
  Future<String?> reactToVideo(String videoId, String type) async {
    final data = await _remoteDataSource.reactToVideo(videoId, type);
    return data['type'] as String?;
  }

  @override
  Future<VideoReactions> getReactions(String videoId) async {
    return VideoReactions.fromJson(await _remoteDataSource.getReactions(videoId));
  }

  @override
  Future<List<VideoComment>> getComments(String videoId) async {
    final data = await _remoteDataSource.getComments(videoId);
    return data.map(VideoComment.fromJson).toList();
  }

  @override
  Future<VideoComment> addComment(String videoId, String content) async {
    return VideoComment.fromJson(await _remoteDataSource.addComment(videoId, content));
  }

  @override
  Future<VideoComment> updateComment(String videoId, String commentId, String content) async {
    return VideoComment.fromJson(
        await _remoteDataSource.updateComment(videoId, commentId, content));
  }

  @override
  Future<void> deleteComment(String videoId, String commentId) =>
      _remoteDataSource.deleteComment(videoId, commentId);

  @override
  Future<void> reportVideo(String videoId, String reason, {String? details}) =>
      _remoteDataSource.reportVideo(videoId, reason, details: details);
}
