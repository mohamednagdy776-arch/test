import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/video.dart';
import '../../domain/use_cases/get_video_use_case.dart';
import '../../domain/use_cases/toggle_video_like_use_case.dart';
import '../../domain/use_cases/react_to_video_use_case.dart';
import '../../domain/use_cases/get_video_reactions_use_case.dart';
import '../../domain/use_cases/get_video_comments_use_case.dart';
import '../../domain/use_cases/add_video_comment_use_case.dart';
import '../../domain/use_cases/update_video_comment_use_case.dart';
import '../../domain/use_cases/delete_video_comment_use_case.dart';
import 'video_detail_state.dart';

// Keyed by videoId, same family pattern as PostDetailNotifier -- pushed
// directly with an already-known id (no GoRoute), fetches its own full
// detail (video + comments + reactions) on initState.
class VideoDetailNotifier extends StateNotifier<VideoDetailState> {
  final String videoId;
  final GetVideoUseCase _getVideo;
  final ToggleVideoLikeUseCase _toggleLike;
  final ReactToVideoUseCase _reactToVideo;
  final GetVideoReactionsUseCase _getReactions;
  final GetVideoCommentsUseCase _getComments;
  final AddVideoCommentUseCase _addComment;
  final UpdateVideoCommentUseCase _updateComment;
  final DeleteVideoCommentUseCase _deleteComment;

  VideoDetailNotifier(
    this.videoId,
    this._getVideo,
    this._toggleLike,
    this._reactToVideo,
    this._getReactions,
    this._getComments,
    this._addComment,
    this._updateComment,
    this._deleteComment,
  ) : super(const VideoDetailState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final video = await _getVideo(videoId);
      final comments = await _getComments(videoId);
      final reactions = await _getReactions(videoId);
      state = state.copyWith(
        video: video,
        comments: comments,
        reactions: reactions,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الفيديو');
    }
  }

  Future<void> refresh() => load();

  Future<void> toggleLike() async {
    final video = state.video;
    if (video == null) return;
    final optimistic = _copyVideoWith(
      video,
      isLiked: !video.isLiked,
      likeCount: video.isLiked ? video.likeCount - 1 : video.likeCount + 1,
    );
    state = state.copyWith(video: optimistic);
    try {
      await _toggleLike(videoId, video.isLiked);
    } catch (_) {
      state = state.copyWith(video: video); // revert
    }
  }

  Future<void> react(String type) async {
    final previous = state.reactions;
    try {
      await _reactToVideo(videoId, type);
      final reactions = await _getReactions(videoId);
      state = state.copyWith(reactions: reactions);
    } catch (_) {
      state = state.copyWith(reactions: previous, error: 'تعذّر إضافة التفاعل');
    }
  }

  Future<void> _reloadComments() async {
    try {
      final comments = await _getComments(videoId);
      state = state.copyWith(comments: comments);
    } catch (_) {
      // Keep the previous (now possibly stale) list rather than clearing it.
    }
  }

  Future<void> addComment(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty) return;
    state = state.copyWith(isSubmittingComment: true, error: null);
    try {
      await _addComment(videoId, trimmed);
      await _reloadComments();
      state = state.copyWith(isSubmittingComment: false);
    } catch (_) {
      state = state.copyWith(isSubmittingComment: false, error: 'تعذّر إضافة التعليق');
    }
  }

  Future<void> editComment(String commentId, String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty) return;
    try {
      await _updateComment(videoId, commentId, trimmed);
      await _reloadComments();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تعديل التعليق');
    }
  }

  Future<void> deleteComment(String commentId) async {
    try {
      await _deleteComment(videoId, commentId);
      await _reloadComments();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر حذف التعليق');
    }
  }

  Video _copyVideoWith(Video video, {bool? isLiked, int? likeCount}) {
    return Video(
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      viewCount: video.viewCount,
      likeCount: likeCount ?? video.likeCount,
      isLiked: isLiked ?? video.isLiked,
      isReel: video.isReel,
      createdAt: video.createdAt,
      authorId: video.authorId,
      authorName: video.authorName,
      authorUsername: video.authorUsername,
      authorAvatarUrl: video.authorAvatarUrl,
    );
  }
}
