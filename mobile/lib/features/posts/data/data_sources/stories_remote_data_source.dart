import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class StoriesRemoteDataSource {
  final Dio _dio;
  const StoriesRemoteDataSource(this._dio);

  // GET /stories -- active (<24h, non-archived) stories grouped by author,
  // follower-only visibility enforced server-side (confirmed via curl:
  // plain `data` array, not paginated).
  Future<List<Map<String, dynamic>>> getStories() async {
    final response = await _dio.get('/stories');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  // Same two-step upload-then-create flow as PostsRemoteDataSource.createPost
  // and StoryCreator.tsx: raw file first through the shared media endpoint,
  // then the returned URL is what POST /stories actually stores.
  Future<String> uploadMedia(XFile file) async {
    final bytes = await file.readAsBytes();
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: file.name),
    });
    final response = await _dio.post('/upload/media', data: formData);
    return ApiResponse.unwrap(response)['url'] as String;
  }

  Future<Map<String, dynamic>> createStory({
    String? mediaUrl,
    String? mediaType,
    String? thumbnailUrl,
    String? text,
    String? bgColor,
    int? duration,
  }) async {
    final response = await _dio.post('/stories', data: {
      if (mediaUrl != null) 'mediaUrl': mediaUrl,
      if (mediaType != null) 'mediaType': mediaType,
      if (thumbnailUrl != null) 'thumbnailUrl': thumbnailUrl,
      if (text != null && text.isNotEmpty) 'text': text,
      if (bgColor != null) 'bgColor': bgColor,
      if (duration != null) 'duration': duration,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> deleteStory(String storyId) async {
    await _dio.delete('/stories/$storyId');
  }

  Future<void> viewStory(String storyId) async {
    await _dio.post('/stories/$storyId/view');
  }

  Future<Map<String, dynamic>> getStory(String storyId) async {
    final response = await _dio.get('/stories/$storyId');
    return ApiResponse.unwrap(response);
  }

  Future<List<Map<String, dynamic>>> getStoryViewers(String storyId) async {
    final response = await _dio.get('/stories/$storyId/viewers');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  // Toggle-friendly: same route archives and unarchives (returns the
  // updated story so callers can read back the new isArchived).
  Future<Map<String, dynamic>> toggleArchiveStory(String storyId) async {
    final response = await _dio.post('/stories/$storyId/archive');
    return ApiResponse.unwrap(response);
  }

  Future<void> reactToStory(String storyId, String emoji) async {
    await _dio.post('/stories/$storyId/reactions', data: {'emoji': emoji});
  }

  // Own archived stories only (paginated -- confirmed via curl: standard
  // { data, meta } envelope, unlike GET /stories's plain array).
  Future<PaginatedResult<Map<String, dynamic>>> getArchivedStories(
      {int page = 1, int limit = 10}) async {
    final response = await _dio.get('/stories/archived',
        queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }
}
