import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/posts_remote_data_source.dart';
import '../../data/data_sources/comments_remote_data_source.dart';
import '../../data/data_sources/reactions_remote_data_source.dart';
import '../../data/data_sources/stories_remote_data_source.dart';
import '../../data/repositories/posts_repository_impl.dart';
import '../../data/repositories/comments_repository_impl.dart';
import '../../data/repositories/reactions_repository_impl.dart';
import '../../data/repositories/stories_repository_impl.dart';
import '../../domain/repositories/posts_repository.dart';
import '../../domain/repositories/comments_repository.dart';
import '../../domain/repositories/reactions_repository.dart';
import '../../domain/repositories/stories_repository.dart';
import '../../domain/use_cases/get_feed_use_case.dart';
import '../../domain/use_cases/create_post_use_case.dart';
import '../../domain/use_cases/delete_post_use_case.dart';
import '../../domain/use_cases/get_post_use_case.dart';
import '../../domain/use_cases/get_comments_use_case.dart';
import '../../domain/use_cases/add_comment_use_case.dart';
import '../../domain/use_cases/update_comment_use_case.dart';
import '../../domain/use_cases/delete_comment_use_case.dart';
import '../../domain/use_cases/react_to_comment_use_case.dart';
import '../../domain/use_cases/get_post_reactions_use_case.dart';
import '../../domain/use_cases/toggle_post_reaction_use_case.dart';
import '../../domain/use_cases/get_stories_use_case.dart';
import '../../domain/use_cases/create_story_use_case.dart';
import '../../domain/use_cases/delete_story_use_case.dart';
import '../../domain/use_cases/view_story_use_case.dart';
import '../../domain/use_cases/react_to_story_use_case.dart';
import '../../domain/use_cases/archive_story_use_case.dart';
import '../../domain/use_cases/get_story_viewers_use_case.dart';
import '../../domain/use_cases/upload_story_media_use_case.dart';
import '../../domain/use_cases/get_archived_stories_use_case.dart';
import '../state/feed_notifier.dart';
import '../state/feed_state.dart';
import '../state/post_detail_notifier.dart';
import '../state/post_detail_state.dart';
import '../state/stories_notifier.dart';
import '../state/stories_state.dart';
import '../../../../core/api/dio_client.dart';

final postsRemoteDataSourceProvider = Provider((ref) {
  return PostsRemoteDataSource(DioClient.create());
});

final commentsRemoteDataSourceProvider = Provider((ref) {
  return CommentsRemoteDataSource(DioClient.create());
});

final reactionsRemoteDataSourceProvider = Provider((ref) {
  return ReactionsRemoteDataSource(DioClient.create());
});

final storiesRemoteDataSourceProvider = Provider((ref) {
  return StoriesRemoteDataSource(DioClient.create());
});

final postsRepositoryProvider = Provider<PostsRepository>((ref) {
  return PostsRepositoryImpl(ref.read(postsRemoteDataSourceProvider));
});

final commentsRepositoryProvider = Provider<CommentsRepository>((ref) {
  return CommentsRepositoryImpl(ref.read(commentsRemoteDataSourceProvider));
});

final reactionsRepositoryProvider = Provider<ReactionsRepository>((ref) {
  return ReactionsRepositoryImpl(ref.read(reactionsRemoteDataSourceProvider));
});

final storiesRepositoryProvider = Provider<StoriesRepository>((ref) {
  return StoriesRepositoryImpl(ref.read(storiesRemoteDataSourceProvider));
});

final getFeedUseCaseProvider = Provider((ref) {
  return GetFeedUseCase(ref.read(postsRepositoryProvider));
});

final createPostUseCaseProvider = Provider((ref) {
  return CreatePostUseCase(ref.read(postsRepositoryProvider));
});

final deletePostUseCaseProvider = Provider((ref) {
  return DeletePostUseCase(ref.read(postsRepositoryProvider));
});

final getPostUseCaseProvider = Provider((ref) {
  return GetPostUseCase(ref.read(postsRepositoryProvider));
});

final getCommentsUseCaseProvider = Provider((ref) {
  return GetCommentsUseCase(ref.read(commentsRepositoryProvider));
});

final addCommentUseCaseProvider = Provider((ref) {
  return AddCommentUseCase(ref.read(commentsRepositoryProvider));
});

final updateCommentUseCaseProvider = Provider((ref) {
  return UpdateCommentUseCase(ref.read(commentsRepositoryProvider));
});

final deleteCommentUseCaseProvider = Provider((ref) {
  return DeleteCommentUseCase(ref.read(commentsRepositoryProvider));
});

final reactToCommentUseCaseProvider = Provider((ref) {
  return ReactToCommentUseCase(ref.read(commentsRepositoryProvider));
});

final getPostReactionsUseCaseProvider = Provider((ref) {
  return GetPostReactionsUseCase(ref.read(reactionsRepositoryProvider));
});

final togglePostReactionUseCaseProvider = Provider((ref) {
  return TogglePostReactionUseCase(ref.read(reactionsRepositoryProvider));
});

final getStoriesUseCaseProvider = Provider((ref) {
  return GetStoriesUseCase(ref.read(storiesRepositoryProvider));
});

final createStoryUseCaseProvider = Provider((ref) {
  return CreateStoryUseCase(ref.read(storiesRepositoryProvider));
});

final deleteStoryUseCaseProvider = Provider((ref) {
  return DeleteStoryUseCase(ref.read(storiesRepositoryProvider));
});

final viewStoryUseCaseProvider = Provider((ref) {
  return ViewStoryUseCase(ref.read(storiesRepositoryProvider));
});

final reactToStoryUseCaseProvider = Provider((ref) {
  return ReactToStoryUseCase(ref.read(storiesRepositoryProvider));
});

final archiveStoryUseCaseProvider = Provider((ref) {
  return ArchiveStoryUseCase(ref.read(storiesRepositoryProvider));
});

final getStoryViewersUseCaseProvider = Provider((ref) {
  return GetStoryViewersUseCase(ref.read(storiesRepositoryProvider));
});

final uploadStoryMediaUseCaseProvider = Provider((ref) {
  return UploadStoryMediaUseCase(ref.read(storiesRepositoryProvider));
});

final getArchivedStoriesUseCaseProvider = Provider((ref) {
  return GetArchivedStoriesUseCase(ref.read(storiesRepositoryProvider));
});

final feedProvider = StateNotifierProvider<FeedNotifier, FeedState>((ref) {
  return FeedNotifier(
      ref.read(getFeedUseCaseProvider), ref.read(deletePostUseCaseProvider));
});

final storiesProvider =
    StateNotifierProvider<StoriesNotifier, StoriesState>((ref) {
  return StoriesNotifier(
    ref.read(getStoriesUseCaseProvider),
    ref.read(createStoryUseCaseProvider),
    ref.read(deleteStoryUseCaseProvider),
  );
});

// Keyed by postId, same family pattern as groups' groupDetailProvider --
// pushed directly with an already-known id (no GoRoute), fetches its own
// full detail (post + comments + reactions) on initState.
final postDetailProvider =
    StateNotifierProvider.family<PostDetailNotifier, PostDetailState, String>(
        (ref, postId) {
  return PostDetailNotifier(
    postId,
    ref.read(getPostUseCaseProvider),
    ref.read(getCommentsUseCaseProvider),
    ref.read(addCommentUseCaseProvider),
    ref.read(updateCommentUseCaseProvider),
    ref.read(deleteCommentUseCaseProvider),
    ref.read(reactToCommentUseCaseProvider),
    ref.read(getPostReactionsUseCaseProvider),
    ref.read(togglePostReactionUseCaseProvider),
  );
});
