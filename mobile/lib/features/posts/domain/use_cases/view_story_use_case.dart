import '../repositories/stories_repository.dart';

class ViewStoryUseCase {
  final StoriesRepository _repository;
  const ViewStoryUseCase(this._repository);

  Future<void> call(String storyId) => _repository.viewStory(storyId);
}
