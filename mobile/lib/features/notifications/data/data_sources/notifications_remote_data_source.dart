import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class NotificationsRemoteDataSource {
  final Dio _dio;
  const NotificationsRemoteDataSource(this._dio);

  Future<PaginatedResult<Map<String, dynamic>>> getNotifications({int page = 1, int limit = 20, String? type}) async {
    final response = await _dio.get('/notifications', queryParameters: {
      'page': page,
      'limit': limit,
      if (type != null) 'type': type,
    });
    return ApiResponse.unwrapPaginated(response, (json) => json);
  }

  Future<int> getUnreadCount() async {
    final response = await _dio.get('/notifications/unread-count');
    final data = ApiResponse.unwrap(response);
    return data['count'] as int? ?? 0;
  }

  Future<void> markAsRead(String id) async {
    await _dio.patch('/notifications/$id/read');
  }

  Future<void> markAllRead() async {
    await _dio.patch('/notifications/read-all');
  }

  Future<void> registerDeviceToken(String token, String platform) async {
    await _dio.post('/notifications/device-token', data: {'token': token, 'platform': platform});
  }

  Future<Map<String, dynamic>> getPreferences() async {
    final response = await _dio.get('/notifications/preferences');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updatePreferences(Map<String, bool> changes) async {
    final response = await _dio.put('/notifications/preferences', data: changes);
    return ApiResponse.unwrap(response);
  }
}
