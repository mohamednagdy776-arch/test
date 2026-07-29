import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_recommended_videos_use_case.dart';
import '../../domain/use_cases/get_trending_videos_use_case.dart';
import '../../domain/use_cases/get_following_videos_use_case.dart';
import '../../domain/use_cases/get_continue_watching_use_case.dart';
import 'watch_state.dart';

// Loads all four tabs/sections up front rather than lazily per-tab-switch
// (unlike web's WatchPage, which only enables the active tab's query) --
// these are small, cheap paginated lists (page 1, default limit) and a
// simpler "load everything once" notifier avoids a per-tab loaded/loading
// state machine for what's a fairly low-traffic screen.
class WatchNotifier extends StateNotifier<WatchState> {
  final GetRecommendedVideosUseCase _getRecommended;
  final GetTrendingVideosUseCase _getTrending;
  final GetFollowingVideosUseCase _getFollowing;
  final GetContinueWatchingUseCase _getContinueWatching;

  WatchNotifier(
    this._getRecommended,
    this._getTrending,
    this._getFollowing,
    this._getContinueWatching,
  ) : super(const WatchState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final results = await Future.wait([
        _getRecommended(),
        _getTrending(),
        _getFollowing(),
        _getContinueWatching(),
      ]);
      state = state.copyWith(
        recommended: results[0].items,
        trending: results[1].items,
        following: results[2].items,
        continueWatching: results[3].items,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'فشل تحميل الفيديوهات');
    }
  }

  Future<void> refresh() => loadInitial();

  void switchTab(WatchTab tab) {
    state = state.copyWith(activeTab: tab);
  }
}
