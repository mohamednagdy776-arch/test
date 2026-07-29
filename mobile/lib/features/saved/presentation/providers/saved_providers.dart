import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/saved_remote_data_source.dart';
import '../../data/repositories/saved_repository_impl.dart';
import '../../domain/repositories/saved_repository.dart';
import '../../domain/use_cases/get_saved_items_use_case.dart';
import '../../domain/use_cases/save_item_use_case.dart';
import '../../domain/use_cases/unsave_item_use_case.dart';
import '../../domain/use_cases/check_saved_use_case.dart';
import '../../domain/use_cases/get_collections_use_case.dart';
import '../../domain/use_cases/create_collection_use_case.dart';
import '../../domain/use_cases/update_collection_use_case.dart';
import '../../domain/use_cases/delete_collection_use_case.dart';
import '../../domain/use_cases/get_collection_items_use_case.dart';
import '../state/saved_notifier.dart';
import '../state/saved_state.dart';
import '../state/collections_notifier.dart';
import '../state/collections_state.dart';
import '../../../../core/api/dio_client.dart';

final savedRemoteDataSourceProvider = Provider((ref) {
  return SavedRemoteDataSource(DioClient.create());
});

final savedRepositoryProvider = Provider<SavedRepository>((ref) {
  return SavedRepositoryImpl(ref.read(savedRemoteDataSourceProvider));
});

final getSavedItemsUseCaseProvider = Provider((ref) {
  return GetSavedItemsUseCase(ref.read(savedRepositoryProvider));
});

final saveItemUseCaseProvider = Provider((ref) {
  return SaveItemUseCase(ref.read(savedRepositoryProvider));
});

final unsaveItemUseCaseProvider = Provider((ref) {
  return UnsaveItemUseCase(ref.read(savedRepositoryProvider));
});

final checkSavedUseCaseProvider = Provider((ref) {
  return CheckSavedUseCase(ref.read(savedRepositoryProvider));
});

final getCollectionsUseCaseProvider = Provider((ref) {
  return GetCollectionsUseCase(ref.read(savedRepositoryProvider));
});

final createCollectionUseCaseProvider = Provider((ref) {
  return CreateCollectionUseCase(ref.read(savedRepositoryProvider));
});

final updateCollectionUseCaseProvider = Provider((ref) {
  return UpdateCollectionUseCase(ref.read(savedRepositoryProvider));
});

final deleteCollectionUseCaseProvider = Provider((ref) {
  return DeleteCollectionUseCase(ref.read(savedRepositoryProvider));
});

final getCollectionItemsUseCaseProvider = Provider((ref) {
  return GetCollectionItemsUseCase(ref.read(savedRepositoryProvider));
});

final savedProvider = StateNotifierProvider<SavedNotifier, SavedState>((ref) {
  return SavedNotifier(
    ref.read(getSavedItemsUseCaseProvider),
    ref.read(unsaveItemUseCaseProvider),
  );
});

final collectionsProvider = StateNotifierProvider<CollectionsNotifier, CollectionsState>((ref) {
  return CollectionsNotifier(
    ref.read(getCollectionsUseCaseProvider),
    ref.read(createCollectionUseCaseProvider),
    ref.read(deleteCollectionUseCaseProvider),
  );
});
