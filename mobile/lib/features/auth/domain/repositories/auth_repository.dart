import '../entities/auth_tokens.dart';

abstract class AuthRepository {
  Future<AuthTokens> login({required String email, required String password});
  Future<AuthTokens> register({
    required String email,
    required String phone,
    required String password,
    required String dateOfBirth,
    String? referralCode,
  });
  Future<void> forgotPassword({required String email});
  Future<void> resetPassword({required String token, required String password});
  Future<void> verifyEmail({required String token});
  Future<void> resendVerification({required String email});
  Future<void> confirmEmailChange({required String token});
  Future<void> logout();
  Future<bool> isLoggedIn();
}
