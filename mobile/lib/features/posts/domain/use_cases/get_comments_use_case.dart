import '../entities/comment.dart';
import '../repositories/comments_repository.dart';

class GetCommentsUseCase {
  final CommentsRepository _repository;
  const GetCommentsUseCase(this._repository);

  Future<List<Comment>> call(String postId) => _repository.getComments(postId);
}
