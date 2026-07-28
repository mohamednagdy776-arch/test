import '../entities/post.dart';
import '../repositories/posts_repository.dart';

class GetPostUseCase {
  final PostsRepository _repository;
  const GetPostUseCase(this._repository);

  Future<Post> call(String postId) => _repository.getPost(postId);
}
