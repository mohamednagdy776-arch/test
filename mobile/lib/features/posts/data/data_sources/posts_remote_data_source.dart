import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/poll_option.dart';
import '../../domain/entities/poll_voter.dart';

class PostsRemoteDataSource {
  final Dio _dio;
  const PostsRemoteDataSource(this._dio);

  Future<CursorPage<Map<String, dynamic>>> getFeed(
      {String? cursor, int limit = 10}) async {
    final response = await _dio.get('/feed', queryParameters: {
      if (cursor != null) 'cursor': cursor,
      'limit': limit,
    });
    return ApiResponse.unwrapCursorPage(response, (json) => json);
  }

  Future<CursorPage<Map<String, dynamic>>> getRecentFeed(
      {String? cursor, int limit = 10}) async {
    final response = await _dio.get('/feed/recent', queryParameters: {
      if (cursor != null) 'cursor': cursor,
      'limit': limit,
    });
    return ApiResponse.unwrapCursorPage(response, (json) => json);
  }

  // Two-step: upload the image (if any) through the shared media endpoint,
  // then create the post with the returned URL -- matches
  // backend/src/posts/controllers/upload.controller.ts +
  // backend/src/posts/controllers/stories.controller.ts's createPost.
  //
  // Phase 23: extended with the composer fields CreatePostDto actually
  // accepts (backend/src/posts/dto/create-post.dto.ts, curl-verified live) --
  // bgColor/feeling/location/audience/pollOptions, all optional and
  // whitelisted server-side by the global ValidationPipe.
  Future<Map<String, dynamic>> createPost({
    required String content,
    XFile? image,
    String? bgColor,
    String? feeling,
    String? location,
    String? audience,
    List<PollOption>? pollOptions,
  }) async {
    String? mediaUrl;
    if (image != null) {
      final bytes = await image.readAsBytes();
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(bytes, filename: image.name),
      });
      final uploadResponse = await _dio.post('/upload/media', data: formData);
      mediaUrl = ApiResponse.unwrap(uploadResponse)['url'] as String?;
    }

    final response = await _dio.post('/posts', data: {
      'content': content,
      if (mediaUrl != null) 'mediaUrl': mediaUrl,
      if (mediaUrl != null) 'mediaType': 'image',
      if (bgColor != null) 'bgColor': bgColor,
      if (feeling != null) 'feeling': feeling,
      if (location != null) 'location': location,
      if (audience != null) 'audience': audience,
      if (pollOptions != null) 'postType': 'poll',
      if (pollOptions != null)
        'pollOptions': pollOptions.map((o) => o.toCreateJson()).toList(),
    });
    return ApiResponse.unwrap(response);
  }

  // GET /posts/:id -- confirmed live to return the same shape as a feed
  // item (single `data` object, `user` nested the same way), so Post.fromJson
  // covers it without a dedicated single-post model.
  Future<Map<String, dynamic>> getPost(String postId) async {
    final response = await _dio.get('/posts/$postId');
    return ApiResponse.unwrap(response);
  }

  // Mirrors web's own EditPostModal (content-only edit) -- PATCH /posts/:id
  // takes the full CreatePostDto shape, but only `content` is sent here.
  Future<Map<String, dynamic>> updatePost(String postId,
      {required String content}) async {
    final response = await _dio.patch('/posts/$postId', data: {'content': content});
    return ApiResponse.unwrap(response);
  }

  Future<void> deletePost(String postId) async {
    await _dio.delete('/posts/$postId');
  }

  Future<void> savePost(String postId) async {
    await _dio.post('/posts/$postId/save');
  }

  Future<void> unsavePost(String postId) async {
    await _dio.delete('/posts/$postId/save');
  }

  // Toggle-friendly: same route archives and unarchives (returns the
  // updated post so callers can read back the new isArchived), same pattern
  // as StoriesRemoteDataSource.toggleArchiveStory.
  Future<Map<String, dynamic>> archivePost(String postId) async {
    final response = await _dio.post('/posts/$postId/archive');
    return ApiResponse.unwrap(response);
  }

  // Own archived posts only (paginated -- confirmed via curl: standard
  // { data, meta } envelope).
  Future<PaginatedResult<Map<String, dynamic>>> getArchivedPosts(
      {int page = 1, int limit = 10}) async {
    final response = await _dio.get('/posts/archived',
        queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  // POST /posts/:id/hide { hideType, snoozeDays? } -- curl-verified live,
  // returns `{ success: true }` with no other useful data.
  Future<void> hidePost(String postId,
      {required String hideType, int? snoozeDays}) async {
    await _dio.post('/posts/$postId/hide', data: {
      'hideType': hideType,
      if (snoozeDays != null) 'snoozeDays': snoozeDays,
    });
  }

  // POST /posts/:id/poll/:optionIndex/vote -- curl-verified live response:
  // { success, pollOptions: [{text, votes}], myVote }.
  Future<PollVoteResult> votePoll(String postId, int optionIndex) async {
    final response = await _dio.post('/posts/$postId/poll/$optionIndex/vote');
    return PollVoteResult.fromJson(ApiResponse.unwrap(response));
  }

  // GET /posts/:id/poll/voters -- owner-only (403 for anyone else),
  // curl-verified live: a plain array, not the usual { data } single-object
  // envelope wrapping a list, so ApiResponse.unwrapList applies here.
  Future<List<PollVoterOption>> getPollVoters(String postId) async {
    final response = await _dio.get('/posts/$postId/poll/voters');
    return ApiResponse.unwrapList(response)
        .cast<Map<String, dynamic>>()
        .map(PollVoterOption.fromJson)
        .toList();
  }
}
