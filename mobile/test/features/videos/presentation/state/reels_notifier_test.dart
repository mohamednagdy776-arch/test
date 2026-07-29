import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/videos/domain/entities/video.dart';
import 'package:tayyibt/features/videos/domain/repositories/videos_repository.dart';
import 'package:tayyibt/features/videos/domain/use_cases/get_reels_use_case.dart';
import 'package:tayyibt/features/videos/domain/use_cases/toggle_video_like_use_case.dart';
import 'package:tayyibt/features/videos/presentation/state/reels_notifier.dart';

class MockVideosRepository extends Mock implements VideosRepository {}

Video _video(String id, {bool isLiked = false, int likeCount = 0}) {
  return Video(
    id: id,
    title: 'reel $id',
    isReel: true,
    createdAt: DateTime(2026, 1, 1),
    authorId: 'u1',
    authorName: 'Amina',
    isLiked: isLiked,
    likeCount: likeCount,
  );
}

void main() {
  late MockVideosRepository repository;
  late ReelsNotifier notifier;

  setUp(() {
    repository = MockVideosRepository();
    notifier = ReelsNotifier(GetReelsUseCase(repository), ToggleVideoLikeUseCase(repository));
  });

  test('loadInitial populates items and hasMore from the page metadata', () async {
    when(() => repository.getReels(page: 1, limit: any(named: 'limit'))).thenAnswer(
      (_) async => PaginatedResult(items: [_video('r1')], total: 2, page: 1, limit: 1, totalPages: 2),
    );

    await notifier.loadInitial();

    expect(notifier.state.items.single.id, 'r1');
    expect(notifier.state.hasMore, isTrue);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getReels(page: 1, limit: any(named: 'limit'))).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.items, isEmpty);
  });

  test('loadMore appends deduped items and advances the page', () async {
    when(() => repository.getReels(page: 1, limit: any(named: 'limit'))).thenAnswer(
      (_) async => PaginatedResult(items: [_video('r1')], total: 2, page: 1, limit: 1, totalPages: 2),
    );
    await notifier.loadInitial();

    when(() => repository.getReels(page: 2, limit: any(named: 'limit'))).thenAnswer(
      (_) async => PaginatedResult(items: [_video('r1'), _video('r2')], total: 2, page: 2, limit: 2, totalPages: 2),
    );
    await notifier.loadMore();

    expect(notifier.state.items.map((v) => v.id), ['r1', 'r2']);
    expect(notifier.state.hasMore, isFalse);
  });

  test('toggleLike optimistically flips isLiked/likeCount then confirms with the repository', () async {
    when(() => repository.getReels(page: 1, limit: any(named: 'limit'))).thenAnswer(
      (_) async => PaginatedResult(items: [_video('r1', isLiked: false, likeCount: 3)], total: 1, page: 1, limit: 1, totalPages: 1),
    );
    await notifier.loadInitial();

    when(() => repository.toggleLike('r1', false)).thenAnswer((_) async => true);

    await notifier.toggleLike('r1');

    expect(notifier.state.items.single.isLiked, isTrue);
    expect(notifier.state.items.single.likeCount, 4);
  });

  test('toggleLike reverts the optimistic update when the repository throws', () async {
    when(() => repository.getReels(page: 1, limit: any(named: 'limit'))).thenAnswer(
      (_) async => PaginatedResult(items: [_video('r1', isLiked: false, likeCount: 3)], total: 1, page: 1, limit: 1, totalPages: 1),
    );
    await notifier.loadInitial();

    when(() => repository.toggleLike('r1', false)).thenThrow(Exception('network error'));

    await notifier.toggleLike('r1');

    expect(notifier.state.items.single.isLiked, isFalse);
    expect(notifier.state.items.single.likeCount, 3);
  });
}
