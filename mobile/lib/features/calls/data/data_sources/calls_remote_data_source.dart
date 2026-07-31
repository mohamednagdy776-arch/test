import 'package:dio/dio.dart';
import '../../../../core/api/api_response.dart';

class CallsRemoteDataSource {
  final Dio _dio;
  const CallsRemoteDataSource(this._dio);

  /// GET /calls/ice-servers -- standard {success,message,data:{iceServers}}
  /// envelope (confirmed against backend/src/chat/controllers/calls.controller.ts).
  Future<List<Map<String, dynamic>>> getIceServers() async {
    final response = await _dio.get('/calls/ice-servers');
    final data = ApiResponse.unwrap(response);
    final servers = data['iceServers'] as List<dynamic>? ?? const [];
    return servers.cast<Map<String, dynamic>>();
  }
}
