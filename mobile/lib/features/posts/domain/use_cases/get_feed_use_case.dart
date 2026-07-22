import '../../../../core/api/api_response.dart';
import '../entities/post.dart';
import '../repositories/posts_repository.dart';

class GetFeedUseCase {
  final PostsRepository _repository;
  const GetFeedUseCase(this._repository);

  Future<CursorPage<Post>> call({String? cursor, int limit = 10}) {
    return _repository.getFeed(cursor: cursor, limit: limit);
  }
}
