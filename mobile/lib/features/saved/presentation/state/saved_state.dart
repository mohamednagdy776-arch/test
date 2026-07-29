import '../../domain/entities/saved_item.dart';

class SavedState {
  final List<SavedItem> items;
  final bool isLoading;
  final String? error;

  const SavedState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  SavedState copyWith({
    List<SavedItem>? items,
    bool? isLoading,
    String? error,
  }) {
    return SavedState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
