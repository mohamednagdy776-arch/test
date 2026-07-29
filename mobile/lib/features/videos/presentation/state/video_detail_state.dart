import '../../domain/entities/video.dart';
import '../../domain/entities/video_comment.dart';

class VideoDetailState {
  final Video? video;
  final List<VideoComment> comments;
  final VideoReactions reactions;
  final bool isLoading;
  final bool isSubmittingComment;
  final String? error;

  const VideoDetailState({
    this.video,
    this.comments = const [],
    this.reactions = const VideoReactions(),
    this.isLoading = false,
    this.isSubmittingComment = false,
    this.error,
  });

  VideoDetailState copyWith({
    Video? video,
    List<VideoComment>? comments,
    VideoReactions? reactions,
    bool? isLoading,
    bool? isSubmittingComment,
    String? error,
  }) {
    return VideoDetailState(
      video: video ?? this.video,
      comments: comments ?? this.comments,
      reactions: reactions ?? this.reactions,
      isLoading: isLoading ?? this.isLoading,
      isSubmittingComment: isSubmittingComment ?? this.isSubmittingComment,
      error: error,
    );
  }
}
