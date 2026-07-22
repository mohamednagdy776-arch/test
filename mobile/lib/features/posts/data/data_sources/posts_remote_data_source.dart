import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class PostsRemoteDataSource {
  final Dio _dio;
  const PostsRemoteDataSource(this._dio);

  Future<CursorPage<Map<String, dynamic>>> getFeed({String? cursor, int limit = 10}) async {
    final response = await _dio.get('/feed', queryParameters: {
      if (cursor != null) 'cursor': cursor,
      'limit': limit,
    });
    return ApiResponse.unwrapCursorPage(response, (json) => json);
  }

  Future<CursorPage<Map<String, dynamic>>> getRecentFeed({String? cursor, int limit = 10}) async {
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
  Future<Map<String, dynamic>> createPost({required String content, XFile? image}) async {
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
    });
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
}
