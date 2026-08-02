import '../repositories/auth_repository.dart';

class ResendVerificationUseCase {
  final AuthRepository repository;
  const ResendVerificationUseCase(this.repository);

  Future<void> call({required String email}) {
    return repository.resendVerification(email: email);
  }
}
