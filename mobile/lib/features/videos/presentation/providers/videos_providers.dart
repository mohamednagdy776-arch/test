import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/videos_remote_data_source.dart';
import '../../data/repositories/videos_repository_impl.dart';
import '../../domain/repositories/videos_repository.dart';
import '../../domain/use_cases/get_reels_use_case.dart';
import '../../domain/use_cases/get_trending_videos_use_case.dart';
import '../../domain/use_cases/get_recommended_videos_use_case.dart';
import '../../domain/use_cases/get_following_videos_use_case.dart';
import '../../domain/use_cases/get_continue_watching_use_case.dart';
import '../../domain/use_cases/get_video_use_case.dart';
import '../../domain/use_cases/upload_video_media_use_case.dart';
import '../../domain/use_cases/create_video_use_case.dart';
import '../../domain/use_cases/delete_video_use_case.dart';
import '../../domain/use_cases/toggle_video_like_use_case.dart';
import '../../domain/use_cases/react_to_video_use_case.dart';
import '../../domain/use_cases/get_video_reactions_use_case.dart';
import '../../domain/use_cases/get_video_comments_use_case.dart';
import '../../domain/use_cases/add_video_comment_use_case.dart';
import '../../domain/use_cases/update_video_comment_use_case.dart';
import '../../domain/use_cases/delete_video_comment_use_case.dart';
import '../../domain/use_cases/report_video_use_case.dart';
import '../state/reels_notifier.dart';
import '../state/reels_state.dart';
import '../state/watch_notifier.dart';
import '../state/watch_state.dart';
import '../state/video_detail_notifier.dart';
import '../state/video_detail_state.dart';
import '../../../../core/api/dio_client.dart';
// Save (Phase 25) reuses the Saved/Collections feature's own use cases
// (built Phase 14, already reused this way by posts in Phase 23) instead of
// duplicating save/check logic inside the videos feature.
import '../../../saved/presentation/providers/saved_providers.dart';

final videosRemoteDataSourceProvider = Provider((ref) {
  return VideosRemoteDataSource(DioClient.create());
});

final videosRepositoryProvider = Provider<VideosRepository>((ref) {
  return VideosRepositoryImpl(ref.read(videosRemoteDataSourceProvider));
});

final getReelsUseCaseProvider = Provider((ref) {
  return GetReelsUseCase(ref.read(videosRepositoryProvider));
});

final getTrendingVideosUseCaseProvider = Provider((ref) {
  return GetTrendingVideosUseCase(ref.read(videosRepositoryProvider));
});

final getRecommendedVideosUseCaseProvider = Provider((ref) {
  return GetRecommendedVideosUseCase(ref.read(videosRepositoryProvider));
});

final getFollowingVideosUseCaseProvider = Provider((ref) {
  return GetFollowingVideosUseCase(ref.read(videosRepositoryProvider));
});

final getContinueWatchingUseCaseProvider = Provider((ref) {
  return GetContinueWatchingUseCase(ref.read(videosRepositoryProvider));
});

final getVideoUseCaseProvider = Provider((ref) {
  return GetVideoUseCase(ref.read(videosRepositoryProvider));
});

final uploadVideoMediaUseCaseProvider = Provider((ref) {
  return UploadVideoMediaUseCase(ref.read(videosRepositoryProvider));
});

final createVideoUseCaseProvider = Provider((ref) {
  return CreateVideoUseCase(ref.read(videosRepositoryProvider));
});

final deleteVideoUseCaseProvider = Provider((ref) {
  return DeleteVideoUseCase(ref.read(videosRepositoryProvider));
});

final toggleVideoLikeUseCaseProvider = Provider((ref) {
  return ToggleVideoLikeUseCase(ref.read(videosRepositoryProvider));
});

final reactToVideoUseCaseProvider = Provider((ref) {
  return ReactToVideoUseCase(ref.read(videosRepositoryProvider));
});

final getVideoReactionsUseCaseProvider = Provider((ref) {
  return GetVideoReactionsUseCase(ref.read(videosRepositoryProvider));
});

final getVideoCommentsUseCaseProvider = Provider((ref) {
  return GetVideoCommentsUseCase(ref.read(videosRepositoryProvider));
});

final addVideoCommentUseCaseProvider = Provider((ref) {
  return AddVideoCommentUseCase(ref.read(videosRepositoryProvider));
});

final updateVideoCommentUseCaseProvider = Provider((ref) {
  return UpdateVideoCommentUseCase(ref.read(videosRepositoryProvider));
});

final deleteVideoCommentUseCaseProvider = Provider((ref) {
  return DeleteVideoCommentUseCase(ref.read(videosRepositoryProvider));
});

final reportVideoUseCaseProvider = Provider((ref) {
  return ReportVideoUseCase(ref.read(videosRepositoryProvider));
});

final reelsProvider = StateNotifierProvider<ReelsNotifier, ReelsState>((ref) {
  return ReelsNotifier(
    ref.read(getReelsUseCaseProvider),
    ref.read(toggleVideoLikeUseCaseProvider),
  );
});

final watchProvider = StateNotifierProvider<WatchNotifier, WatchState>((ref) {
  return WatchNotifier(
    ref.read(getRecommendedVideosUseCaseProvider),
    ref.read(getTrendingVideosUseCaseProvider),
    ref.read(getFollowingVideosUseCaseProvider),
    ref.read(getContinueWatchingUseCaseProvider),
  );
});

final videoDetailProvider = StateNotifierProvider.family<VideoDetailNotifier,
    VideoDetailState, String>((ref, videoId) {
  return VideoDetailNotifier(
    videoId,
    ref.read(getVideoUseCaseProvider),
    ref.read(toggleVideoLikeUseCaseProvider),
    ref.read(reactToVideoUseCaseProvider),
    ref.read(getVideoReactionsUseCaseProvider),
    ref.read(getVideoCommentsUseCaseProvider),
    ref.read(addVideoCommentUseCaseProvider),
    ref.read(updateVideoCommentUseCaseProvider),
    ref.read(deleteVideoCommentUseCaseProvider),
    ref.read(getRecommendedVideosUseCaseProvider),
    ref.read(checkSavedUseCaseProvider),
    ref.read(saveItemUseCaseProvider),
  );
});
