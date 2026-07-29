import '../../domain/entities/story.dart';

class StoriesState {
  final List<StoryGroup> groups;
  final bool isLoading;
  final String? error;

  const StoriesState({
    this.groups = const [],
    this.isLoading = false,
    this.error,
  });

  StoriesState copyWith({
    List<StoryGroup>? groups,
    bool? isLoading,
    String? error,
  }) {
    return StoriesState(
      groups: groups ?? this.groups,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
