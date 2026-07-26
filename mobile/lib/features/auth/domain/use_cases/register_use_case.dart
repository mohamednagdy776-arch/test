import '../entities/auth_tokens.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;
  const RegisterUseCase(this.repository);

  Future<AuthTokens> call({
    required String email,
    required String phone,
    required String password,
    required String dateOfBirth,
  }) {
    return repository.register(email: email, phone: phone, password: password, dateOfBirth: dateOfBirth);
  }
}
