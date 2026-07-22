import '../repositories/posts_repository.dart';

class DeletePostUseCase {
  final PostsRepository _repository;
  const DeletePostUseCase(this._repository);

  Future<void> call(String postId) => _repository.deletePost(postId);
}
