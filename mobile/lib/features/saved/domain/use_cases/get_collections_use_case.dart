import '../entities/saved_collection.dart';
import '../repositories/saved_repository.dart';

class GetCollectionsUseCase {
  final SavedRepository _repository;
  const GetCollectionsUseCase(this._repository);

  Future<List<SavedCollection>> call() => _repository.getCollections();
}
