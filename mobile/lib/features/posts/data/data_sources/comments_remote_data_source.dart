import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class CommentsRemoteDataSource {
  final Dio _dio;
  const CommentsRemoteDataSource(this._dio);

  // Live shape confirmed via curl: a plain (non-paginated) `data` array of
  // fully nested comments -- see Comment's doc comment.
  Future<List<Map<String, dynamic>>> getComments(String postId) async {
    final response = await _dio.get('/posts/$postId/comments');
    return ApiResponse.unwrapList(response).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> addComment(String postId, {required String content, String? parentId}) async {
    final response = await _dio.post('/posts/$postId/comments', data: {
      'content': content,
      if (parentId != null) 'parentId': parentId,
    });
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateComment(String postId, String commentId, {required String content}) async {
    final response = await _dio.patch('/posts/$postId/comments/$commentId', data: {'content': content});
    return ApiResponse.unwrap(response);
  }

  Future<void> deleteComment(String postId, String commentId) async {
    await _dio.delete('/posts/$postId/comments/$commentId');
  }

  Future<String?> reactToComment(String postId, String commentId, String type) async {
    final response = await _dio.post('/posts/$postId/comments/$commentId/reactions', data: {'type': type});
    final data = ApiResponse.unwrap(response);
    return data['type'] as String?;
  }

  // GET /comments/:id/replies -- a separate top-level `comments` controller
  // (CommentRepliesController), NOT nested under posts/:postId like its
  // sibling endpoints (confirmed live). Paginated; only the first page is
  // fetched since this is unused in the current UI (see repository doc
  // comment).
  Future<List<Map<String, dynamic>>> getReplies(String commentId, {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/comments/$commentId/replies', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json).items;
  }
}
