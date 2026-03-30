import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../domain/entities/auth_tokens.dart';
import '../../domain/repositories/auth_repository.dart';
import '../data_sources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final FlutterSecureStorage storage;

  const AuthRepositoryImpl({required this.remoteDataSource, required this.storage});

  @override
  Future<AuthTokens> login({required String email, required String password}) async {
    final tokens = await remoteDataSource.login(email: email, password: password);
    await _saveTokens(tokens);
    return tokens;
  }

  @override
  Future<AuthTokens> register({required String email, required String phone, required String password}) async {
    final tokens = await remoteDataSource.register(email: email, phone: phone, password: password);
    await _saveTokens(tokens);
    return tokens;
  }

  @override
  Future<void> logout() async {
    await storage.delete(key: 'access_token');
    await storage.delete(key: 'refresh_token');
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = await storage.read(key: 'access_token');
    return token != null && token.isNotEmpty;
  }

  Future<void> _saveTokens(AuthTokens tokens) async {
    await storage.write(key: 'access_token', value: tokens.accessToken);
    await storage.write(key: 'refresh_token', value: tokens.refreshToken);
  }
}
