import '../entities/comment.dart';

abstract class CommentsRepository {
  Future<List<Comment>> getComments(String postId);
  Future<Comment> addComment(String postId,
      {required String content, String? parentId});
  Future<Comment> updateComment(String postId, String commentId,
      {required String content});
  Future<void> deleteComment(String postId, String commentId);

  /// Toggles the viewer's reaction on a comment; returns the new reaction
  /// type, or null if the toggle removed it (reacting again with the same
  /// type un-reacts -- matches the live { reacted, type } response).
  Future<String?> reactToComment(String postId, String commentId, String type);

  /// GET /comments/:id/replies -- not nested under posts/:postId (confirmed
  /// live). getComments() already returns the full nested reply tree, so
  /// this exists for API-surface completeness/parity with the documented
  /// endpoint rather than being called from the post detail screen.
  Future<List<Comment>> getReplies(String commentId);
}
