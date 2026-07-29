import '../../../../core/api/api_response.dart';
import '../entities/story.dart';
import '../repositories/stories_repository.dart';

class GetArchivedStoriesUseCase {
  final StoriesRepository _repository;
  const GetArchivedStoriesUseCase(this._repository);

  Future<PaginatedResult<Story>> call({int page = 1, int limit = 10}) =>
      _repository.getArchivedStories(page: page, limit: limit);
}
