import '../entities/auth_tokens.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;
  const LoginUseCase(this.repository);

  Future<AuthTokens> call({required String email, required String password}) {
    return repository.login(email: email, password: password);
  }
}
