import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../entities/post.dart';

abstract class PostsRepository {
  Future<CursorPage<Post>> getFeed({String? cursor, int limit = 10});
  Future<CursorPage<Post>> getRecentFeed({String? cursor, int limit = 10});
  Future<Post> getPost(String postId);
  Future<Post> createPost({required String content, XFile? image});
  Future<void> deletePost(String postId);
  Future<void> savePost(String postId);
  Future<void> unsavePost(String postId);

  /// Toggles isArchived <-> unarchived; returns the updated post.
  Future<Post> archivePost(String postId);
  Future<PaginatedResult<Post>> getArchivedPosts({int page = 1, int limit = 10});
}
