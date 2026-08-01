import '../entities/post.dart';
import '../repositories/posts_repository.dart';

// Mirrors web's own EditPostModal: content-only edit.
class UpdatePostUseCase {
  final PostsRepository _repository;
  const UpdatePostUseCase(this._repository);

  Future<Post> call(String postId, {required String content}) =>
      _repository.updatePost(postId, content: content);
}
