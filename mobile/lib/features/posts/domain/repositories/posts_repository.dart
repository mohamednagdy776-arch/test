import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_response.dart';
import '../entities/post.dart';
import '../entities/poll_option.dart';
import '../entities/poll_voter.dart';

abstract class PostsRepository {
  Future<CursorPage<Post>> getFeed({String? cursor, int limit = 10});
  Future<CursorPage<Post>> getRecentFeed({String? cursor, int limit = 10});
  Future<Post> getPost(String postId);
  Future<Post> createPost({
    required String content,
    XFile? image,
    String? bgColor,
    String? feeling,
    String? location,
    String? audience,
    List<PollOption>? pollOptions,
  });

  /// Web's own EditPostModal only ever lets the author change `content`
  /// (see web/src/features/posts/components/PostCard.tsx's EditPostModal) --
  /// mirrored here rather than re-exposing every composer field for editing.
  Future<Post> updatePost(String postId, {required String content});

  Future<void> deletePost(String postId);

  /// Legacy `/posts/:id/save` + `/posts/:id/save` (DELETE) toggle -- kept for
  /// API-surface completeness, but NOT what the Save menu item uses. Web's
  /// own PostCard menu calls the generic saved-items module (`POST /saved`
  /// with `{ entityType: 'post', entityId }`) instead, confirmed by reading
  /// web/src/features/posts/hooks.ts's useSavePost -> savedPostsApi.saveItem
  /// -- mobile's new Save menu item reuses SaveItemUseCase from the `saved`
  /// feature (Phase 14) for the same reason, not these two methods.
  Future<void> savePost(String postId);
  Future<void> unsavePost(String postId);

  /// Toggles isArchived <-> unarchived; returns the updated post.
  Future<Post> archivePost(String postId);
  Future<PaginatedResult<Post>> getArchivedPosts({int page = 1, int limit = 10});

  Future<void> hidePost(String postId, {required String hideType, int? snoozeDays});

  Future<PollVoteResult> votePoll(String postId, int optionIndex);

  /// Owner-only -- the backend 403s for any other viewer.
  Future<List<PollVoterOption>> getPollVoters(String postId);
}
