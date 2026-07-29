import '../../domain/entities/video.dart';

enum WatchTab { recommended, trending, following }

class WatchState {
  final WatchTab activeTab;
  final List<Video> continueWatching;
  final List<Video> recommended;
  final List<Video> trending;
  final List<Video> following;
  final bool isLoading;
  final String? error;

  const WatchState({
    this.activeTab = WatchTab.recommended,
    this.continueWatching = const [],
    this.recommended = const [],
    this.trending = const [],
    this.following = const [],
    this.isLoading = false,
    this.error,
  });

  List<Video> get activeItems {
    switch (activeTab) {
      case WatchTab.recommended:
        return recommended;
      case WatchTab.trending:
        return trending;
      case WatchTab.following:
        return following;
    }
  }

  WatchState copyWith({
    WatchTab? activeTab,
    List<Video>? continueWatching,
    List<Video>? recommended,
    List<Video>? trending,
    List<Video>? following,
    bool? isLoading,
    String? error,
  }) {
    return WatchState(
      activeTab: activeTab ?? this.activeTab,
      continueWatching: continueWatching ?? this.continueWatching,
      recommended: recommended ?? this.recommended,
      trending: trending ?? this.trending,
      following: following ?? this.following,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
