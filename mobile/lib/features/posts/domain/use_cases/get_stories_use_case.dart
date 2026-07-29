import '../entities/story.dart';
import '../repositories/stories_repository.dart';

class GetStoriesUseCase {
  final StoriesRepository _repository;
  const GetStoriesUseCase(this._repository);

  Future<List<StoryGroup>> call() => _repository.getStories();
}
