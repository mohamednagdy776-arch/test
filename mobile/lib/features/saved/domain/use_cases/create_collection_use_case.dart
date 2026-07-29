import '../entities/saved_collection.dart';
import '../repositories/saved_repository.dart';

class CreateCollectionUseCase {
  final SavedRepository _repository;
  const CreateCollectionUseCase(this._repository);

  Future<SavedCollection> call(String name, {String? coverImage}) =>
      _repository.createCollection(name, coverImage: coverImage);
}
