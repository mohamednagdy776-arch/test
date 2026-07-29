import '../entities/post.dart';
import '../repositories/posts_repository.dart';

class ArchivePostUseCase {
  final PostsRepository _repository;
  const ArchivePostUseCase(this._repository);

  Future<Post> call(String postId) => _repository.archivePost(postId);
}
