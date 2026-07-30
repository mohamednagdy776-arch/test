import '../entities/appearance_settings.dart';
import '../repositories/settings_repository.dart';

class AppearanceUseCase {
  final SettingsRepository _repository;
  const AppearanceUseCase(this._repository);

  Future<AppearanceSettings> getSettings() => _repository.getAppearanceSettings();

  Future<AppearanceSettings> updateSettings(Map<String, dynamic> changes) =>
      _repository.updateAppearanceSettings(changes);
}
