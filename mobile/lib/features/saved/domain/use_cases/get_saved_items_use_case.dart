import '../entities/saved_item.dart';
import '../repositories/saved_repository.dart';

class GetSavedItemsUseCase {
  final SavedRepository _repository;
  const GetSavedItemsUseCase(this._repository);

  Future<List<SavedItem>> call() => _repository.getSaved();
}
