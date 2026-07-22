import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';

class ProfileRemoteDataSource {
  final Dio _dio;

  ProfileRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getMyProfile() async {
    final response = await _dio.get('/users/me');
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.patch('/users/me', data: data);
    return ApiResponse.unwrap(response);
  }

  // Reads bytes instead of using MultipartFile.fromFile(path) -- XFile's path
  // isn't a real filesystem path on web, so byte-reading is the one approach
  // that works on every platform.
  Future<Map<String, dynamic>> uploadAvatar(XFile file) async {
    final bytes = await file.readAsBytes();
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: file.name),
    });
    final response = await _dio.post('/users/me/avatar', data: formData);
    return ApiResponse.unwrap(response);
  }

  Future<Map<String, dynamic>> getUserProfile(String userId) async {
    final response = await _dio.get('/users/$userId/profile');
    return ApiResponse.unwrap(response);
  }
}
