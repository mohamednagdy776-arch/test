import '../repositories/auth_repository.dart';

class ResetPasswordUseCase {
  final AuthRepository repository;
  const ResetPasswordUseCase(this.repository);

  Future<void> call({required String token, required String password}) {
    return repository.resetPassword(token: token, password: password);
  }
}
