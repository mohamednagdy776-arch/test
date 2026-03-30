import '../entities/auth_tokens.dart';

abstract class AuthRepository {
  Future<AuthTokens> login({required String email, required String password});
  Future<AuthTokens> register({required String email, required String phone, required String password});
  Future<void> logout();
  Future<bool> isLoggedIn();
}
