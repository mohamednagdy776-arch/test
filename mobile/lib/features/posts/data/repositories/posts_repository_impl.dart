import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/post.dart';
import '../../domain/repositories/posts_repository.dart';
import '../data_sources/posts_remote_data_source.dart';

class PostsRepositoryImpl implements PostsRepository {
  final PostsRemoteDataSource _remoteDataSource;
  const PostsRepositoryImpl(this._remoteDataSource);

  @override
  Future<CursorPage<Post>> getFeed({String? cursor, int limit = 10}) async {
    final page = await _remoteDataSource.getFeed(cursor: cursor, limit: limit);
    return CursorPage(items: page.items.map(Post.fromJson).toList(), cursor: page.cursor, hasMore: page.hasMore);
  }

  @override
  Future<CursorPage<Post>> getRecentFeed({String? cursor, int limit = 10}) async {
    final page = await _remoteDataSource.getRecentFeed(cursor: cursor, limit: limit);
    return CursorPage(items: page.items.map(Post.fromJson).toList(), cursor: page.cursor, hasMore: page.hasMore);
  }

  @override
  Future<Post> createPost({required String content, XFile? image}) async {
    final data = await _remoteDataSource.createPost(content: content, image: image);
    return Post.fromJson(data);
  }

  @override
  Future<void> deletePost(String postId) => _remoteDataSource.deletePost(postId);

  @override
  Future<void> savePost(String postId) => _remoteDataSource.savePost(postId);

  @override
  Future<void> unsavePost(String postId) => _remoteDataSource.unsavePost(postId);
}
