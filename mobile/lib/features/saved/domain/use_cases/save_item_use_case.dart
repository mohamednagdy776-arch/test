import '../repositories/saved_repository.dart';

class SaveItemUseCase {
  final SavedRepository _repository;
  const SaveItemUseCase(this._repository);

  Future<void> call(String entityType, String entityId, {String? collectionId}) =>
      _repository.save(entityType, entityId, collectionId: collectionId);
}
