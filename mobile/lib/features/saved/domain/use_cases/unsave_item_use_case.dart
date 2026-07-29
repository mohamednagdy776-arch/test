import '../repositories/saved_repository.dart';

class UnsaveItemUseCase {
  final SavedRepository _repository;
  const UnsaveItemUseCase(this._repository);

  Future<void> call(String itemId) => _repository.unsave(itemId);
}
