import '../repositories/comments_repository.dart';

class ReactToCommentUseCase {
  final CommentsRepository _repository;
  const ReactToCommentUseCase(this._repository);

  /// Returns the new reaction type, or null if the toggle removed it.
  Future<String?> call(String postId, String commentId, String type) {
    return _repository.reactToComment(postId, commentId, type);
  }
}
