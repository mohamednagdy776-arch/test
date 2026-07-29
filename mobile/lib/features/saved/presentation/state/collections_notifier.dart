import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_collections_use_case.dart';
import '../../domain/use_cases/create_collection_use_case.dart';
import '../../domain/use_cases/delete_collection_use_case.dart';
import 'collections_state.dart';

class CollectionsNotifier extends StateNotifier<CollectionsState> {
  final GetCollectionsUseCase _getCollections;
  final CreateCollectionUseCase _createCollection;
  final DeleteCollectionUseCase _deleteCollection;

  CollectionsNotifier(this._getCollections, this._createCollection, this._deleteCollection)
      : super(const CollectionsState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final collections = await _getCollections();
      state = state.copyWith(collections: collections, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل المجموعات');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> createCollection(String name) async {
    await _createCollection(name);
    await loadInitial();
  }

  Future<void> deleteCollection(String id) async {
    await _deleteCollection(id);
    state = state.copyWith(collections: state.collections.where((c) => c.id != id).toList());
  }
}
