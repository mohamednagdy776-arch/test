import '../../domain/entities/saved_collection.dart';

class CollectionsState {
  final List<SavedCollection> collections;
  final bool isLoading;
  final String? error;

  const CollectionsState({
    this.collections = const [],
    this.isLoading = false,
    this.error,
  });

  CollectionsState copyWith({
    List<SavedCollection>? collections,
    bool? isLoading,
    String? error,
  }) {
    return CollectionsState(
      collections: collections ?? this.collections,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
