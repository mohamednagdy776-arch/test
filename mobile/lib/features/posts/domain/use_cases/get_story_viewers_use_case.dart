import '../entities/story.dart';
import '../repositories/stories_repository.dart';

class GetStoryViewersUseCase {
  final StoriesRepository _repository;
  const GetStoryViewersUseCase(this._repository);

  Future<List<StoryViewer>> call(String storyId) =>
      _repository.getStoryViewers(storyId);
}
