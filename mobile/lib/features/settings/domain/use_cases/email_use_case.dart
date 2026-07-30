import '../repositories/settings_repository.dart';

class EmailUseCase {
  final SettingsRepository _repository;
  const EmailUseCase(this._repository);

  Future<void> requestEmailChange(String newEmail, String currentPassword) =>
      _repository.requestEmailChange(newEmail, currentPassword);
}
