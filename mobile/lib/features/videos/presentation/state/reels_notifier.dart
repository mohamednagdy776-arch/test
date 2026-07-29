import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/video.dart';
import '../../domain/use_cases/get_reels_use_case.dart';
import '../../domain/use_cases/toggle_video_like_use_case.dart';
import 'reels_state.dart';

class ReelsNotifier extends StateNotifier<ReelsState> {
  final GetReelsUseCase _getReels;
  final ToggleVideoLikeUseCase _toggleLike;

  // No auto-load-on-construct -- same convention as FeedNotifier: the
  // screen's initState triggers loadInitial() via Future.microtask.
  ReelsNotifier(this._getReels, this._toggleLike) : super(const ReelsState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _getReels(page: 1);
      state = ReelsState(
        items: result.items,
        page: 1,
        hasMore: result.page < result.totalPages,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'فشل تحميل الريلز');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.isLoading) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final nextPage = state.page + 1;
      final result = await _getReels(page: nextPage);
      final seenIds = state.items.map((v) => v.id).toSet();
      final deduped = result.items.where((v) => !seenIds.contains(v.id));
      state = state.copyWith(
        items: [...state.items, ...deduped],
        page: nextPage,
        hasMore: result.page < result.totalPages,
        isLoadingMore: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  Future<void> toggleLike(String videoId) async {
    final index = state.items.indexWhere((v) => v.id == videoId);
    if (index == -1) return;
    final video = state.items[index];
    final optimistic = _copyVideoWith(
      video,
      isLiked: !video.isLiked,
      likeCount: video.isLiked ? video.likeCount - 1 : video.likeCount + 1,
    );
    _replaceAt(index, optimistic);
    try {
      await _toggleLike(videoId, video.isLiked);
    } catch (_) {
      _replaceAt(index, video); // revert on failure
    }
  }

  void _replaceAt(int index, Video video) {
    final items = [...state.items];
    items[index] = video;
    state = state.copyWith(items: items);
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
