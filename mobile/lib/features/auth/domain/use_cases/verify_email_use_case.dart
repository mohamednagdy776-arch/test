import '../repositories/auth_repository.dart';

class VerifyEmailUseCase {
  final AuthRepository repository;
  const VerifyEmailUseCase(this.repository);

  Future<void> call({required String token}) {
    return repository.verifyEmail(token: token);
  }
}
