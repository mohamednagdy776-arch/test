import '../entities/comment.dart';
import '../repositories/comments_repository.dart';

class AddCommentUseCase {
  final CommentsRepository _repository;
  const AddCommentUseCase(this._repository);

  Future<Comment> call(String postId, {required String content, String? parentId}) {
    return _repository.addComment(postId, content: content, parentId: parentId);
  }
}
