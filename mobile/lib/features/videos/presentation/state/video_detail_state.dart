import '../../domain/entities/video.dart';
import '../../domain/entities/video_comment.dart';

class VideoDetailState {
  final Video? video;
  final List<VideoComment> comments;
  final VideoReactions reactions;
  final bool isLoading;
  final bool isSubmittingComment;

  // Save (Phase 25, mirrors web's watch/[id] player's save button): whether
  // the current user has already saved this video, and whether a save call
  // is in flight. One-directional like web's own button -- there's no
  // isSavePending->unsaved path here, matching web (see VideoDetailNotifier
  // .toggleSave's doc comment for why unsave isn't offered).
  final bool isSaved;
  final bool isSavePending;

  // Recommended videos (Phase 25, mirrors web's RecommendedSidebar on
  // watch/[id]/page.tsx) -- reuses GetRecommendedVideosUseCase (Phase 13,
  // already powering the Watch screen's "Recommended" tab) rather than a new
  // endpoint; the current video is filtered out by the notifier.
  final List<Video> recommended;

  final String? error;

  const VideoDetailState({
    this.video,
    this.comments = const [],
    this.reactions = const VideoReactions(),
    this.isLoading = false,
    this.isSubmittingComment = false,
    this.isSaved = false,
    this.isSavePending = false,
    this.recommended = const [],
    this.error,
  });

  VideoDetailState copyWith({
    Video? video,
    List<VideoComment>? comments,
    VideoReactions? reactions,
    bool? isLoading,
    bool? isSubmittingComment,
    bool? isSaved,
    bool? isSavePending,
    List<Video>? recommended,
    String? error,
  }) {
    return VideoDetailState(
      video: video ?? this.video,
      comments: comments ?? this.comments,
      reactions: reactions ?? this.reactions,
      isLoading: isLoading ?? this.isLoading,
      isSubmittingComment: isSubmittingComment ?? this.isSubmittingComment,
      isSaved: isSaved ?? this.isSaved,
      isSavePending: isSavePending ?? this.isSavePending,
      recommended: recommended ?? this.recommended,
      error: error,
    );
  }
}
