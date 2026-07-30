import '../entities/verification_status.dart';
import '../repositories/settings_repository.dart';

class VerificationUseCase {
  final SettingsRepository _repository;
  const VerificationUseCase(this._repository);

  Future<IdentityVerificationStatus> getStatus() => _repository.getVerificationStatus();

  Future<void> submit({required String selfiePath, required String idDocumentPath}) =>
      _repository.submitVerification(selfiePath: selfiePath, idDocumentPath: idDocumentPath);
}
