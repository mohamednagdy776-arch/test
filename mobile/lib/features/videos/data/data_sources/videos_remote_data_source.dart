import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class VideosRemoteDataSource {
  final Dio _dio;
  const VideosRemoteDataSource(this._dio);

  Future<PaginatedResult<Map<String, dynamic>>> getVideos(
      {int page = 1, int limit = 20, bool? isReel}) async {
    final response = await _dio.get('/videos', queryParameters: {
      'page': page,
      'limit': limit,
      if (isReel != null) 'isReel': isReel.toString(),
    });
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  // Separate `reels` controller (not just /videos?isReel=true) -- confirmed
  // live, same paginated shape.
  Future<PaginatedResult<Map<String, dynamic>>> getReels(
      {int page = 1, int limit = 20}) async {
    final response = await _dio
        .get('/reels', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getTrending(
      {int page = 1, int limit = 20}) async {
    final response = await _dio
        .get('/videos/trending', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getRecommended(
      {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/videos/recommended',
        queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getFollowing(
      {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/videos/following',
        queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getContinueWatching(
      {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/videos/continue-watching',
        queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<Map<String, dynamic>> getVideo(String videoId) async {
    final response = await _dio.get('/videos/$videoId');
    return ApiResponse.unwrap(response);
  }

  // Two-step upload-then-create, same as posts/stories: raw file through the
  // shared media endpoint, then POST /videos with the returned URL.
  Future<String> uploadMedia(XFile file) async {
    final bytes = await file.readAsBytes();
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: file.name),
    });
    final response = await _dio.post('/upload/media', data: formData);
    return ApiResponse.unwrap(response)['url'] as String;
  }

  Future<Map<String, dynamic>> createVideo({
    required String title,
    String? description,
    required String url,
    String? thumbnail,
    int? duration,
    bool isReel = false,
  }) async {
    final response = await _dio.post('/videos', data: {
      'title': title,
      if (description != null && description.isNotEmpty) 'description': description,
      'url': url,
      if (thumbnail != null) 'thumbnail': thumbnail,
      if (duration != null) 'duration': duration,
      'isReel': isReel,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> deleteVideo(String videoId) async {
    await _dio.delete('/videos/$videoId');
  }

  Future<Map<String, dynamic>> likeVideo(String videoId) async {
    final response = await _dio.post('/videos/$videoId/like');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> unlikeVideo(String videoId) async {
    final response = await _dio.delete('/videos/$videoId/like');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> reactToVideo(String videoId, String type) async {
    final response =
        await _dio.post('/videos/$videoId/reactions', data: {'type': type});
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getReactions(String videoId) async {
    final response = await _dio.get('/videos/$videoId/reactions');
    return ApiResponse.unwrap(response);
  }

  Future<List<Map<String, dynamic>>> getComments(String videoId) async {
    final response = await _dio.get('/videos/$videoId/comments');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> addComment(String videoId, String content) async {
    final response =
        await _dio.post('/videos/$videoId/comments', data: {'content': content});
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateComment(
      String videoId, String commentId, String content) async {
    final response = await _dio
        .patch('/videos/$videoId/comments/$commentId', data: {'content': content});
    return ApiResponse.unwrap(response);
  }

  // Response's `data` is null on success (confirmed via curl) -- callers
  // don't need the envelope back, just await for the thrown-on-failure side.
  Future<void> deleteComment(String videoId, String commentId) async {
    await _dio.delete('/videos/$videoId/comments/$commentId');
  }

  // Generic content-report endpoint (backend/src/reports/controllers/
  // reports-public.controller.ts) -- POST /reports { entityType, entityId,
  // reason, details? }, curl-confirmed live (`data: null` on success, same
  // as deleteComment above). This is NOT the same mechanism as settings'
  // ReportUseCase (POST /support/report, a general "report a problem to
  // support" form with a completely different payload shape) -- that one
  // reports a bug/complaint, this one reports a specific piece of content,
  // matching what web's ReelMenu/ReportReelModal and the watch/[id] player's
  // report button both call.
  Future<void> reportVideo(String videoId, String reason, {String? details}) async {
    await _dio.post('/reports', data: {
      'entityType': 'video',
      'entityId': videoId,
      'reason': reason,
      if (details != null && details.isNotEmpty) 'details': details,
    });
  }
}
