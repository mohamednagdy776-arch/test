import '../entities/comment.dart';
import '../repositories/comments_repository.dart';

class UpdateCommentUseCase {
  final CommentsRepository _repository;
  const UpdateCommentUseCase(this._repository);

  Future<Comment> call(String postId, String commentId, {required String content}) {
    return _repository.updateComment(postId, commentId, content: content);
  }
}
