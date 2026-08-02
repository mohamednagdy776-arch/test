import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class FriendsRemoteDataSource {
  final Dio _dio;
  const FriendsRemoteDataSource(this._dio);

  Future<PaginatedResult<Map<String, dynamic>>> getFriends({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/friends/list', queryParameters: {'page': page, 'limit': limit});
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<List<dynamic>> getIncomingRequests() async {
    final response = await _dio.get('/friends/requests/incoming');
    return ApiResponse.unwrapList(response);
  }

  Future<List<dynamic>> getSentRequests() async {
    final response = await _dio.get('/friends/requests/sent');
    return ApiResponse.unwrapList(response);
  }

  Future<List<dynamic>> getSuggestions({int limit = 10}) async {
    final response = await _dio.get('/friends/suggestions', queryParameters: {'limit': limit});
    return ApiResponse.unwrapList(response);
  }

  Future<Map<String, dynamic>> getStatus(String userId) async {
    final response = await _dio.get('/friends/status/$userId');
    return ApiResponse.unwrap(response);
  }

  Future<void> sendRequest(String userId) async {
    await _dio.post('/friends/request', data: {'userId': userId});
  }

  Future<void> acceptRequest(String requestId) async {
    await _dio.post('/friends/request/$requestId/accept');
  }

  Future<void> declineRequest(String requestId) async {
    await _dio.post('/friends/request/$requestId/decline');
  }

  Future<void> cancelRequest(String requestId) async {
    await _dio.delete('/friends/request/$requestId');
  }

  Future<void> unfriend(String userId) async {
    await _dio.delete('/friends/$userId');
  }

  Future<void> follow(String userId) async {
    await _dio.post('/friends/follow/$userId');
  }

  Future<void> unfollow(String userId) async {
    await _dio.delete('/friends/follow/$userId');
  }

  Future<void> block(String userId) async {
    await _dio.post('/friends/block', data: {'userId': userId});
  }

  Future<void> unblock(String userId) async {
    await _dio.delete('/friends/block/$userId');
  }

  Future<List<dynamic>> getBirthdays() async {
    final response = await _dio.get('/friends/birthdays');
    return ApiResponse.unwrapList(response);
  }

  Future<List<dynamic>> getFriendLists() async {
    final response = await _dio.get('/friends/lists');
    return ApiResponse.unwrapList(response);
  }

  Future<Map<String, dynamic>> createFriendList(String name) async {
    final response = await _dio.post('/friends/lists', data: {'name': name});
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateFriendList(String listId, {String? name, List<String>? memberIds}) async {
    final response = await _dio.patch('/friends/lists/$listId', data: {
      if (name != null) 'name': name,
      if (memberIds != null) 'memberIds': memberIds,
    });
    return ApiResponse.unwrap(response);
  }

  Future<void> deleteFriendList(String listId) async {
    await _dio.delete('/friends/lists/$listId');
  }
}
