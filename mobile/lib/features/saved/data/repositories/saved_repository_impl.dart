import '../../domain/entities/saved_item.dart';
import '../../domain/entities/saved_collection.dart';
import '../../domain/repositories/saved_repository.dart';
import '../data_sources/saved_remote_data_source.dart';

class SavedRepositoryImpl implements SavedRepository {
  final SavedRemoteDataSource _remote;
  const SavedRepositoryImpl(this._remote);

  @override
  Future<List<SavedItem>> getSaved() async {
    final items = await _remote.getSaved();
    return items.map(SavedItem.fromJson).toList();
  }

  @override
  Future<void> save(String entityType, String entityId, {String? collectionId}) =>
      _remote.save(entityType, entityId, collectionId: collectionId);

  @override
  Future<void> unsave(String itemId) => _remote.unsave(itemId);

  @override
  Future<bool> checkSaved(String entityType, String entityId) =>
      _remote.checkSaved(entityType, entityId);

  @override
  Future<List<SavedCollection>> getCollections() async {
    final items = await _remote.getCollections();
    return items.map(SavedCollection.fromJson).toList();
  }

  @override
  Future<SavedCollection> createCollection(String name, {String? coverImage}) async {
    final json = await _remote.createCollection(name, coverImage: coverImage);
    return SavedCollection.fromJson(json);
  }

  @override
  Future<SavedCollection> updateCollection(String id, {String? name, String? coverImage}) async {
    final json = await _remote.updateCollection(id, name: name, coverImage: coverImage);
    return SavedCollection.fromJson(json);
  }

  @override
  Future<void> deleteCollection(String id) => _remote.deleteCollection(id);

  @override
  Future<List<SavedItem>> getCollectionItems(String collectionId) async {
    final items = await _remote.getCollectionItems(collectionId);
    return items.map(SavedItem.fromJson).toList();
  }
}
