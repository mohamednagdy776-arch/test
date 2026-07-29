import '../entities/story.dart';
import '../repositories/stories_repository.dart';

class ArchiveStoryUseCase {
  final StoriesRepository _repository;
  const ArchiveStoryUseCase(this._repository);

  /// Toggle-friendly -- returns the updated story.
  Future<Story> call(String storyId) => _repository.toggleArchiveStory(storyId);
}
