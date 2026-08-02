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

  // curl-verified live: DELETE /groups/:id is @Roles('admin')-gated
  // server-side against the platform accountType, not group membership --
  // it 403s even for the group's own owner/admin (same broken pattern as
  // pages' delete, see page_detail_screen.dart). Still wired up to match
  // web's (equally broken) UI parity; see group_detail_screen.dart.
  Future<void> deleteGroup(String id) async {
    await _dio.delete('/groups/$id');
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

  // ── Owner/admin-gated moderation actions (Phase 26) ──────────────────
  // All curl-verified live: each returns the raw GroupMember row (its own
  // `id`, not the target user's id), which the caller doesn't need since it
  // re-fetches getMembers()/getGroup() right after -- response bodies are
  // discarded here.

  Future<void> inviteMember(String id, String userId) async {
    await _dio.post('/groups/$id/members/$userId/invite');
  }

  Future<void> banMember(String id, String userId) async {
    await _dio.post('/groups/$id/members/$userId/ban');
  }

  Future<void> unbanMember(String id, String userId) async {
    await _dio.post('/groups/$id/members/$userId/unban');
  }

  Future<void> approveJoinRequest(String id, String userId) async {
    await _dio.post('/groups/$id/members/$userId/approve');
  }

  Future<void> rejectJoinRequest(String id, String userId) async {
    await _dio.post('/groups/$id/members/$userId/reject');
  }
}
