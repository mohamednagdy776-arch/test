import '../../../../core/api/api_response.dart';
import '../../../posts/domain/entities/post.dart';
import '../repositories/pages_repository.dart';

class PagePostsUseCase {
  final PagesRepository _repository;
  const PagePostsUseCase(this._repository);

  Future<PaginatedResult<Post>> getPosts(String pageId, {int page = 1, int limit = 20}) =>
      _repository.getPagePosts(pageId, page: page, limit: limit);

  Future<Post> createPost(String pageId, {required String content}) =>
      _repository.createPagePost(pageId, content: content);
}
