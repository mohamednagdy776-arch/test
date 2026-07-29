import '../repositories/stories_repository.dart';

class ReactToStoryUseCase {
  final StoriesRepository _repository;
  const ReactToStoryUseCase(this._repository);

  Future<void> call(String storyId, String emoji) =>
      _repository.reactToStory(storyId, emoji);
}
