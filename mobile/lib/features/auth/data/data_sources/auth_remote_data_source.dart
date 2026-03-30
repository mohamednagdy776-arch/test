import 'package:dio/dio.dart';
import '../models/auth_tokens_model.dart';
import '../../../../core/errors/failures.dart';

class AuthRemoteDataSource {
  final Dio dio;
  const AuthRemoteDataSource(this.dio);

  Future<AuthTokensModel> login({required String email, required String password}) async {
    try {
      final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
      return AuthTokensModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Login failed';
      throw AuthFailure(msg.toString());
    }
  }

  Future<AuthTokensModel> register({
    required String email,
    required String phone,
    required String password,
  }) async {
    try {
      final res = await dio.post('/auth/register', data: {
        'email': email,
        'phone': phone,
        'password': password,
      });
      return AuthTokensModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Registration failed';
      throw AuthFailure(msg.toString());
    }
  }
}
