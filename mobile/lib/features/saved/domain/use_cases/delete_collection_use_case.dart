import '../repositories/saved_repository.dart';

class DeleteCollectionUseCase {
  final SavedRepository _repository;
  const DeleteCollectionUseCase(this._repository);

  Future<void> call(String id) => _repository.deleteCollection(id);
}
