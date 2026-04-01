import 'package:dio/dio.dart';

class MatchingRemoteDataSource {
  final Dio _dio;

  MatchingRemoteDataSource(this._dio);

  Future<List<dynamic>> getMatches({String? status}) async {
    final response = await _dio.get('/matches', queryParameters: status != null ? {'status': status} : null);
    return response.data['data'];
  }

  Future<Map<String, dynamic>> getMatch(String id) async {
    final response = await _dio.get('/matches/$id');
    return response.data['data'];
  }

  Future<Map<String, dynamic>> acceptMatch(String id) async {
    final response = await _dio.patch('/matches/$id/accept');
    return response.data;
  }

  Future<Map<String, dynamic>> rejectMatch(String id) async {
    final response = await _dio.patch('/matches/$id/reject');
    return response.data;
  }
}
