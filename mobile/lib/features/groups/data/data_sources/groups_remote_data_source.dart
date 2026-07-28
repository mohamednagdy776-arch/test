import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class GroupsRemoteDataSource {
  final Dio _dio;
  const GroupsRemoteDataSource(this._dio);

  Future<PaginatedResult<Map<String, dynamic>>> getGroups({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/groups', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getPublicGroups({int page = 1, int limit = 20, String? category}) async {
    final response = await _dio.get('/groups/public', queryParameters: {
      'page': page,
      'limit': limit,
      if (category != null && category.isNotEmpty) 'category': category,
    });
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<List<dynamic>> getMyGroups() async {
    final response = await _dio.get('/groups/my');
    return ApiResponse.unwrapList(response);
  }

  Future<List<dynamic>> getSuggestedGroups({int limit = 5}) async {
    final response = await _dio.get('/groups/suggested', queryParameters: {'limit': limit});
    return ApiResponse.unwrapList(response);
  }

  Future<Map<String, dynamic>> searchGroups(String query) async {
    final response = await _dio.get('/groups/search', queryParameters: {'q': query});
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getGroup(String id) async {
    final response = await _dio.get('/groups/$id');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> createGroup({
    required String name,
    String? description,
    String privacy = 'public',
    String? category,
  }) async {
    // @IsOptional() only skips null/undefined, never '' -- filter unset/empty
    // optional fields before sending (project-wide gotcha).
    final response = await _dio.post('/groups', data: {
      'name': name,
      'privacy': privacy,
      if (description != null && description.isNotEmpty) 'description': description,
      if (category != null && category.isNotEmpty) 'category': category,
    });
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateGroup(String id, {String? name, String? description, String? category}) async {
    final response = await _dio.patch('/groups/$id', data: {
      if (name != null && name.isNotEmpty) 'name': name,
      if (description != null && description.isNotEmpty) 'description': description,
      if (category != null && category.isNotEmpty) 'category': category,
    });
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> joinGroup(String id) async {
    final response = await _dio.post('/groups/$id/join');
    return ApiResponse.unwrap(response);
  }

  Future<void> leaveGroup(String id) async {
    await _dio.delete('/groups/$id/leave');
  }

  // GET /groups/:id/members's `data` is itself { data: [...], total } --
  // not the shared paginated() envelope -- so this returns the raw unwrapped
  // map rather than going through unwrapPaginated.
  Future<Map<String, dynamic>> getMembers(String id, {int page = 1, int limit = 50}) async {
    final response = await _dio.get('/groups/$id/members', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrap(response);
  }

  Future<PaginatedResult<Map<String, dynamic>>> getGroupPosts(String id, {int page = 1, int limit = 20}) async {
    final response = await _dio.get('/groups/$id/posts', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<Map<String, dynamic>> createGroupPost(String id, {required String content}) async {
    final response = await _dio.post('/groups/$id/posts', data: {'content': content});
    return ApiResponse.unwrap(response);
  }
}
