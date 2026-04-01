import 'package:dio/dio.dart';

class ProfileRemoteDataSource {
  final Dio _dio;

  ProfileRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getMyProfile() async {
    final response = await _dio.get('/users/me');
    return response.data['data'];
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.patch('/users/me', data: data);
    return response.data['data'];
  }

  Future<Map<String, dynamic>> uploadAvatar(FormData formData) async {
    final response = await _dio.post('/users/me/avatar', data: formData);
    return response.data['data'];
  }

  Future<Map<String, dynamic>> getUserProfile(String userId) async {
    final response = await _dio.get('/users/$userId/profile');
    return response.data['data'];
  }
}
