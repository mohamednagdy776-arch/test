import '../entities/saved_item.dart';
import '../repositories/saved_repository.dart';

class GetCollectionItemsUseCase {
  final SavedRepository _repository;
  const GetCollectionItemsUseCase(this._repository);

  Future<List<SavedItem>> call(String collectionId) => _repository.getCollectionItems(collectionId);
}
