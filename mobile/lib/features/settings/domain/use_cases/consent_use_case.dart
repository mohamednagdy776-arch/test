import '../entities/consent_request.dart';
import '../repositories/settings_repository.dart';

class ConsentUseCase {
  final SettingsRepository _repository;
  const ConsentUseCase(this._repository);

  Future<({List<ConsentRequestItem> incoming, List<ConsentRequestItem> outgoing})> getMyConsents() =>
      _repository.getMyConsents();

  Future<void> respondToConsent(String id, bool accept) => _repository.respondToConsent(id, accept);

  Future<void> revokeConsent(String id) => _repository.revokeConsent(id);
}
