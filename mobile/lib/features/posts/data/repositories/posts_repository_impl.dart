import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../../domain/entities/post.dart';
import '../../domain/entities/poll_option.dart';
import '../../domain/entities/poll_voter.dart';
import '../../domain/repositories/posts_repository.dart';
import '../data_sources/posts_remote_data_source.dart';

class PostsRepositoryImpl implements PostsRepository {
  final PostsRemoteDataSource _remoteDataSource;
  const PostsRepositoryImpl(this._remoteDataSource);

  @override
  Future<CursorPage<Post>> getFeed({String? cursor, int limit = 10}) async {
    final page = await _remoteDataSource.getFeed(cursor: cursor, limit: limit);
    return CursorPage(
        items: page.items.map(Post.fromJson).toList(),
        cursor: page.cursor,
        hasMore: page.hasMore);
  }

  @override
  Future<CursorPage<Post>> getRecentFeed(
      {String? cursor, int limit = 10}) async {
    final page =
        await _remoteDataSource.getRecentFeed(cursor: cursor, limit: limit);
    return CursorPage(
        items: page.items.map(Post.fromJson).toList(),
        cursor: page.cursor,
        hasMore: page.hasMore);
  }

  @override
  Future<Post> getPost(String postId) async {
    final data = await _remoteDataSource.getPost(postId);
    return Post.fromJson(data);
  }

  @override
  Future<Post> createPost({
    required String content,
    XFile? image,
    String? bgColor,
    String? feeling,
    String? location,
    String? audience,
    List<PollOption>? pollOptions,
  }) async {
    final data = await _remoteDataSource.createPost(
      content: content,
      image: image,
      bgColor: bgColor,
      feeling: feeling,
      location: location,
      audience: audience,
      pollOptions: pollOptions,
    );
    return Post.fromJson(data);
  }

  @override
  Future<Post> updatePost(String postId, {required String content}) async {
    final data = await _remoteDataSource.updatePost(postId, content: content);
    return Post.fromJson(data);
  }

  @override
  Future<void> deletePost(String postId) =>
      _remoteDataSource.deletePost(postId);

  @override
  Future<void> savePost(String postId) => _remoteDataSource.savePost(postId);

  @override
  Future<void> unsavePost(String postId) =>
      _remoteDataSource.unsavePost(postId);

  @override
  Future<Post> archivePost(String postId) async {
    final data = await _remoteDataSource.archivePost(postId);
    return Post.fromJson(data);
  }

  @override
  Future<PaginatedResult<Post>> getArchivedPosts({int page = 1, int limit = 10}) async {
    final result = await _remoteDataSource.getArchivedPosts(page: page, limit: limit);
    return PaginatedResult<Post>(
      items: result.items.map(Post.fromJson).toList(),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    );
  }

  @override
  Future<void> hidePost(String postId, {required String hideType, int? snoozeDays}) =>
      _remoteDataSource.hidePost(postId, hideType: hideType, snoozeDays: snoozeDays);

  @override
  Future<PollVoteResult> votePoll(String postId, int optionIndex) =>
      _remoteDataSource.votePoll(postId, optionIndex);

  @override
  Future<List<PollVoterOption>> getPollVoters(String postId) =>
      _remoteDataSource.getPollVoters(postId);
}
