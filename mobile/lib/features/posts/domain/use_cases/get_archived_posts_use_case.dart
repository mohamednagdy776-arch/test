import '../../../../core/api/api_response.dart';
import '../entities/post.dart';
import '../repositories/posts_repository.dart';

class GetArchivedPostsUseCase {
  final PostsRepository _repository;
  const GetArchivedPostsUseCase(this._repository);

  Future<PaginatedResult<Post>> call({int page = 1, int limit = 10}) =>
      _repository.getArchivedPosts(page: page, limit: limit);
}
