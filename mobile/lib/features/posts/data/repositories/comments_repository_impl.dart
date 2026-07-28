import '../../domain/entities/comment.dart';
import '../../domain/repositories/comments_repository.dart';
import '../data_sources/comments_remote_data_source.dart';

class CommentsRepositoryImpl implements CommentsRepository {
  final CommentsRemoteDataSource _remoteDataSource;
  const CommentsRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<Comment>> getComments(String postId) async {
    final items = await _remoteDataSource.getComments(postId);
    return items.map(Comment.fromJson).toList();
  }

  @override
  Future<Comment> addComment(String postId, {required String content, String? parentId}) async {
    final data = await _remoteDataSource.addComment(postId, content: content, parentId: parentId);
    return Comment.fromJson(data);
  }

  @override
  Future<Comment> updateComment(String postId, String commentId, {required String content}) async {
    final data = await _remoteDataSource.updateComment(postId, commentId, content: content);
    return Comment.fromJson(data);
  }

  @override
  Future<void> deleteComment(String postId, String commentId) =>
      _remoteDataSource.deleteComment(postId, commentId);

  @override
  Future<String?> reactToComment(String postId, String commentId, String type) =>
      _remoteDataSource.reactToComment(postId, commentId, type);

  @override
  Future<List<Comment>> getReplies(String commentId) async {
    final items = await _remoteDataSource.getReplies(commentId);
    return items.map(Comment.fromJson).toList();
  }
}
