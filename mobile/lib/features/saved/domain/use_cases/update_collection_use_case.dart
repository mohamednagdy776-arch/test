import '../entities/saved_collection.dart';
import '../repositories/saved_repository.dart';

class UpdateCollectionUseCase {
  final SavedRepository _repository;
  const UpdateCollectionUseCase(this._repository);

  Future<SavedCollection> call(String id, {String? name, String? coverImage}) =>
      _repository.updateCollection(id, name: name, coverImage: coverImage);
}
