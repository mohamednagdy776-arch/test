import '../repositories/comments_repository.dart';

class DeleteCommentUseCase {
  final CommentsRepository _repository;
  const DeleteCommentUseCase(this._repository);

  Future<void> call(String postId, String commentId) =>
      _repository.deleteComment(postId, commentId);
}
