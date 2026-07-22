import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:image_picker/image_picker.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';
import 'package:tayyibt/features/posts/domain/repositories/posts_repository.dart';
import 'package:tayyibt/features/posts/domain/use_cases/get_feed_use_case.dart';
import 'package:tayyibt/features/posts/domain/use_cases/delete_post_use_case.dart';
import 'package:tayyibt/features/posts/presentation/state/feed_notifier.dart';

class MockPostsRepository extends Mock implements PostsRepository {}

Post _post(String id, {DateTime? createdAt}) {
  return Post(id: id, userId: 'u1', content: 'content $id', createdAt: createdAt ?? DateTime(2026, 1, 1), authorName: 'Test');
}

void main() {
  setUpAll(() {
    registerFallbackValue(XFile(''));
  });

  late MockPostsRepository repository;
  late FeedNotifier notifier;

  setUp(() {
    repository = MockPostsRepository();
    notifier = FeedNotifier(GetFeedUseCase(repository), DeletePostUseCase(repository));
  });

  test('loadInitial populates items, cursor, and hasMore from the first page', () async {
    when(() => repository.getFeed(cursor: null, limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('1'), _post('2')], cursor: 'c2', hasMore: true),
    );

    await notifier.loadInitial();

    expect(notifier.state.items.map((p) => p.id), ['1', '2']);
    expect(notifier.state.cursor, 'c2');
    expect(notifier.state.hasMore, isTrue);
  });

  test('loadMore appends the next page using the stored cursor', () async {
    when(() => repository.getFeed(cursor: null, limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('1')], cursor: 'c1', hasMore: true),
    );
    when(() => repository.getFeed(cursor: 'c1', limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('2')], cursor: null, hasMore: false),
    );

    await notifier.loadInitial();
    await notifier.loadMore();

    expect(notifier.state.items.map((p) => p.id), ['1', '2']);
    expect(notifier.state.hasMore, isFalse);
  });

  test('loadMore dedupes items already present by id', () async {
    when(() => repository.getFeed(cursor: null, limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('1'), _post('2')], cursor: 'c2', hasMore: true),
    );
    // Overlapping page: '2' repeated (e.g. a page-boundary tie), plus new '3'.
    when(() => repository.getFeed(cursor: 'c2', limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('2'), _post('3')], cursor: null, hasMore: false),
    );

    await notifier.loadInitial();
    await notifier.loadMore();

    expect(notifier.state.items.map((p) => p.id), ['1', '2', '3']);
  });

  test('loadMore is a no-op once hasMore is false', () async {
    when(() => repository.getFeed(cursor: null, limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('1')], cursor: null, hasMore: false),
    );

    await notifier.loadInitial();
    await notifier.loadMore();

    // Exactly the one call from loadInitial -- loadMore added nothing.
    verify(() => repository.getFeed(cursor: any(named: 'cursor'), limit: any(named: 'limit'))).called(1);
  });

  test('delete optimistically removes the post, restoring it if the call fails', () async {
    when(() => repository.getFeed(cursor: null, limit: 10)).thenAnswer(
      (_) async => CursorPage(items: [_post('1'), _post('2')], cursor: null, hasMore: false),
    );
    when(() => repository.deletePost('2')).thenThrow(Exception('network error'));

    await notifier.loadInitial();
    await notifier.delete('2');

    expect(notifier.state.items.map((p) => p.id), ['1', '2']);
    expect(notifier.state.error, isNotNull);
  });
}
