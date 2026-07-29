import '../../../posts/domain/entities/post.dart';

class MemoriesState {
  final List<Post> memories;
  final bool isLoading;
  final String? error;

  const MemoriesState({
    this.memories = const [],
    this.isLoading = false,
    this.error,
  });

  MemoriesState copyWith({
    List<Post>? memories,
    bool? isLoading,
    String? error,
  }) {
    return MemoriesState(
      memories: memories ?? this.memories,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
