import 'package:dio/dio.dart';
import '../models/auth_tokens_model.dart';
import '../../../../core/api/api_response.dart';
import '../../../../core/errors/failures.dart';

class AuthRemoteDataSource {
  final Dio dio;
  const AuthRemoteDataSource(this.dio);

  Future<AuthTokensModel> login({required String email, required String password}) async {
    try {
      final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
      return AuthTokensModel.fromJson(ApiResponse.unwrap(res));
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
      return AuthTokensModel.fromJson(ApiResponse.unwrap(res));
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Registration failed';
      throw AuthFailure(msg.toString());
    }
  }

  // Always succeeds server-side regardless of whether the email exists
  // (backend/src/auth/controllers/auth.controller.ts: "Password reset link
  // sent if email exists") -- avoids leaking which emails are registered.
  Future<void> forgotPassword({required String email}) async {
    try {
      await dio.post('/auth/forgot-password', data: {'email': email});
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Request failed';
      throw AuthFailure(msg.toString());
    }
  }

  // token is the 64-hex-char code from the emailed reset link (no app-link
  // deep-linking configured yet, so the user pastes it manually -- see
  // reset_password_screen.dart).
  Future<void> resetPassword({required String token, required String password}) async {
    try {
      await dio.post('/auth/reset-password', data: {'token': token, 'password': password});
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Reset failed';
      throw AuthFailure(msg.toString());
    }
  }
}
