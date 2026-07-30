import '../entities/privacy_settings.dart';
import '../entities/blocked_user.dart';
import '../repositories/settings_repository.dart';

// Bundles every read/mutate action the Privacy settings screen needs (same
// consolidation as NotificationsUseCase in features/notifications).
class PrivacyUseCase {
  final SettingsRepository _repository;
  const PrivacyUseCase(this._repository);

  Future<PrivacySettings> getSettings() => _repository.getPrivacySettings();

  Future<PrivacySettings> updateSettings(Map<String, dynamic> changes) =>
      _repository.updatePrivacySettings(changes);

  Future<List<BlockedUser>> getBlocks() => _repository.getBlocks();

  Future<void> unblockUser(String blockedUserId) => _repository.unblockUser(blockedUserId);

  Future<List<PhotoAccessRequest>> getPhotoAccessRequests() => _repository.getPhotoAccessRequests();

  Future<void> respondToPhotoAccessRequest(String requestId, bool approve) =>
      _repository.respondToPhotoAccessRequest(requestId, approve);

  Future<Map<String, dynamic>> exportMyData() => _repository.exportMyData();
}
