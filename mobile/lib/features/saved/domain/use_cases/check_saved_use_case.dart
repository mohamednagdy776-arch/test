import '../repositories/saved_repository.dart';

class CheckSavedUseCase {
  final SavedRepository _repository;
  const CheckSavedUseCase(this._repository);

  Future<bool> call(String entityType, String entityId) =>
      _repository.checkSaved(entityType, entityId);
}
