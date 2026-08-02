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
    required String dateOfBirth,
    String? referralCode,
  }) async {
    try {
      final res = await dio.post('/auth/register', data: {
        'email': email,
        'phone': phone,
        'password': password,
        'dateOfBirth': dateOfBirth,
        // RegisterDto.referralCode is @IsOptional -- that only skips
        // null/undefined, not '', so an empty field must never be sent
        // (confirmed passes validation live either way, but there's no
        // reason to attempt attribution with a blank code).
        if (referralCode != null && referralCode.isNotEmpty) 'referralCode': referralCode,
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

  // Verifies a freshly-registered account's email with the 64-hex token from
  // the emailed link (backend/src/auth/dto/verify-email.dto.ts). Same
  // no-deep-link-yet situation as resetPassword above -- the user pastes the
  // token manually (see confirm_email_verification_screen.dart).
  //
  // NOTE: AuthService.register() currently hardcodes isVerified: true and
  // login()'s verification check is commented out server-side, so this
  // endpoint currently has no gating effect on login -- confirmed live
  // 2026-08-02. Built anyway so it's ready once that's re-enabled; the
  // request/response contract itself works today (curl-verified), only the
  // "blocks login" behavior is dormant.
  Future<void> verifyEmail({required String token}) async {
    try {
      await dio.post('/auth/verify-email', data: {'token': token});
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Verification failed';
      throw AuthFailure(msg.toString());
    }
  }

  // Always succeeds server-side shape-wise regardless of account state, but
  // unlike forgotPassword the inner data.message DOES differ by whether the
  // account exists / is already verified (curl-verified live) -- a backend
  // quirk, not replicated here. The UI shows its own generic copy instead of
  // relaying the raw message, so this call's return value is intentionally
  // discarded by callers.
  Future<void> resendVerification({required String email}) async {
    try {
      await dio.post('/auth/resend-verification', data: {'email': email});
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Request failed';
      throw AuthFailure(msg.toString());
    }
  }

  // Confirms a pending email-change request (backend/src/auth/dto/change-email.dto.ts's
  // ConfirmEmailChangeDto) using the 64-hex token emailed to the NEW address
  // -- also a randomBytes(32) hex token, same shape as the others. Public
  // endpoint (no auth guard): the confirming device/session isn't
  // necessarily logged in, and a successful confirm invalidates all
  // sessions server-side anyway.
  Future<void> confirmEmailChange({required String token}) async {
    try {
      await dio.post('/auth/change-email/confirm', data: {'token': token});
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Confirmation failed';
      throw AuthFailure(msg.toString());
    }
  }
}
