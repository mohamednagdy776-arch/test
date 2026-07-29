import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/videos/domain/entities/video.dart';
import 'package:tayyibt/features/videos/domain/repositories/videos_repository.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_continue_watching_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_following_videos_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_recommended_videos_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_trending_videos_use_case.dart';
import 'package:tayyibt/features/videos/presentation/state/watch_notifier.dart';
import 'package:tayyibt/features/videos/presentation/state/watch_state.dart';

class MockVideosRepository extends Mock implements VideosRepository {}

Video _video(String id) {
  return Video(id: id, title: 'video $id', createdAt: DateTime(2026, 1, 1), authorId: 'u1', authorName: 'Amina');
}

PaginatedResult<Video> _page(List<Video> items) =>
    PaginatedResult(items: items, total: items.length, page: 1, limit: 20, totalPages: 1);

void main() {
  late MockVideosRepository repository;
  late WatchNotifier notifier;

  setUp(() {
    repository = MockVideosRepository();
    notifier = WatchNotifier(
      GetRecommendedVideosUseCase(repository),
      GetTrendingVideosUseCase(repository),
      GetFollowingVideosUseCase(repository),
      GetContinueWatchingUseCase(repository),
    );
  });

  test('loadInitial fetches all four sections in one shot', () async {
    when(() => repository.getRecommended(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video('rec1')]));
    when(() => repository.getTrending(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video('trend1')]));
    when(() => repository.getFollowing(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video('follow1')]));
    when(() => repository.getContinueWatching(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video('cw1')]));

    await notifier.loadInitial();

    expect(notifier.state.recommended.single.id, 'rec1');
    expect(notifier.state.trending.single.id, 'trend1');
    expect(notifier.state.following.single.id, 'follow1');
    expect(notifier.state.continueWatching.single.id, 'cw1');
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadInitial sets an error when any section throws', () async {
    when(() => repository.getRecommended(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenThrow(Exception('network error'));
    when(() => repository.getTrending(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([]));
    when(() => repository.getFollowing(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([]));
    when(() => repository.getContinueWatching(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([]));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
  });

  test('switchTab flips activeTab and activeItems reads from the right list', () async {
    when(() => repository.getRecommended(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video('rec1')]));
    when(() => repository.getTrending(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([_video('trend1')]));
    when(() => repository.getFollowing(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([]));
    when(() => repository.getContinueWatching(page: any(named: 'page'), limit: any(named: 'limit')))
        .thenAnswer((_) async => _page([]));
    await notifier.loadInitial();

    expect(notifier.state.activeItems.single.id, 'rec1');

    notifier.switchTab(WatchTab.trending);

    expect(notifier.state.activeTab, WatchTab.trending);
    expect(notifier.state.activeItems.single.id, 'trend1');
  });
}
