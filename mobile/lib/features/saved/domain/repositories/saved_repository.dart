import '../entities/saved_item.dart';
import '../entities/saved_collection.dart';

abstract class SavedRepository {
  Future<List<SavedItem>> getSaved();

  Future<void> save(String entityType, String entityId, {String? collectionId});

  Future<void> unsave(String itemId);

  Future<bool> checkSaved(String entityType, String entityId);

  Future<List<SavedCollection>> getCollections();

  Future<SavedCollection> createCollection(String name, {String? coverImage});

  Future<SavedCollection> updateCollection(String id, {String? name, String? coverImage});

  Future<void> deleteCollection(String id);

  Future<List<SavedItem>> getCollectionItems(String collectionId);
}
