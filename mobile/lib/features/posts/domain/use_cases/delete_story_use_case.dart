import '../repositories/stories_repository.dart';

class DeleteStoryUseCase {
  final StoriesRepository _repository;
  const DeleteStoryUseCase(this._repository);

  Future<void> call(String storyId) => _repository.deleteStory(storyId);
}
