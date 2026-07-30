import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/pages/domain/entities/page.dart';
import 'package:tayyibt/features/pages/domain/repositories/pages_repository.dart';
import 'package:tayyibt/features/pages/domain/use_cases/page_detail_use_case.dart';
import 'package:tayyibt/features/pages/domain/use_cases/manage_page_use_case.dart';
import 'package:tayyibt/features/pages/domain/use_cases/page_posts_use_case.dart';
import 'package:tayyibt/features/pages/presentation/state/page_detail_notifier.dart';
import 'package:tayyibt/features/posts/domain/entities/post.dart';

class MockPagesRepository extends Mock implements PagesRepository {}

CommunityPage _page({bool? isFollowing, bool? isLiked, bool? isOwner}) => CommunityPage(
      id: 'p1',
      username: 'test-page',
      name: 'Test Page',
      isFollowing: isFollowing,
      isLiked: isLiked,
      isOwner: isOwner,
    );

void main() {
  late MockPagesRepository repository;
  late PageDetailNotifier notifier;

  setUp(() {
    repository = MockPagesRepository();
    notifier = PageDetailNotifier(
      'p1',
      PageDetailUseCase(repository),
      ManagePageUseCase(repository),
      PagePostsUseCase(repository),
    );
  });

  test('load populates the page and posts', () async {
    when(() => repository.getPage('p1')).thenAnswer((_) async => _page());
    when(() => repository.getPagePosts('p1', page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(
        items: [Post(id: 'post1', userId: 'u1', content: 'hi', createdAt: DateTime(2026, 1, 1), authorName: 'Amina')],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      ),
    );

    await notifier.load();

    expect(notifier.state.page?.id, 'p1');
    expect(notifier.state.posts.single.content, 'hi');
    expect(notifier.state.isLoading, isFalse);
  });

  test('load sets an error when the repository throws', () async {
    when(() => repository.getPage('p1')).thenThrow(Exception('not found'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.page, isNull);
  });

  test('toggleFollow follows when not currently following, then reloads', () async {
    when(() => repository.getPage('p1')).thenAnswer((_) async => _page(isFollowing: false));
    when(() => repository.getPagePosts('p1', page: 1, limit: 20)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    await notifier.load();
    when(() => repository.follow('p1')).thenAnswer((_) async => _page(isFollowing: true));

    await notifier.toggleFollow();

    verify(() => repository.follow('p1')).called(1);
    verifyNever(() => repository.unfollow(any()));
    expect(notifier.state.isFollowPending, isFalse);
  });

  test('toggleLike unlikes when currently liked', () async {
    when(() => repository.getPage('p1')).thenAnswer((_) async => _page(isLiked: true));
    when(() => repository.getPagePosts('p1', page: 1, limit: 20)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    await notifier.load();
    when(() => repository.unlike('p1')).thenAnswer((_) async {});

    await notifier.toggleLike();

    verify(() => repository.unlike('p1')).called(1);
    verifyNever(() => repository.like(any()));
  });

  test('createPost prepends the new post and ignores a blank submission', () async {
    when(() => repository.createPagePost('p1', content: 'hello')).thenAnswer(
      (_) async => Post(id: 'post2', userId: 'u1', content: 'hello', createdAt: DateTime(2026, 1, 1), authorName: 'Amina'),
    );

    await notifier.createPost('   ');
    expect(notifier.state.posts, isEmpty);
    verifyNever(() => repository.createPagePost(any(), content: any(named: 'content')));

    await notifier.createPost('hello');
    expect(notifier.state.posts.single.content, 'hello');
    expect(notifier.state.isPosting, isFalse);
  });

  test('update returns true and replaces the page on success', () async {
    when(() => repository.updatePage(
          'p1',
          name: 'New Name',
          description: null,
          category: null,
          privacy: null,
          website: null,
          contactInfo: null,
          location: null,
          hours: null,
          profilePhoto: null,
          coverPhoto: null,
        )).thenAnswer((_) async => const CommunityPage(id: 'p1', username: 'test-page', name: 'New Name'));

    final ok = await notifier.update(name: 'New Name');

    expect(ok, isTrue);
    expect(notifier.state.page?.name, 'New Name');
    expect(notifier.state.isUpdating, isFalse);
  });

  test('update returns false and sets an error on failure', () async {
    when(() => repository.updatePage(
          'p1',
          name: 'x',
          description: null,
          category: null,
          privacy: null,
          website: null,
          contactInfo: null,
          location: null,
          hours: null,
          profilePhoto: null,
          coverPhoto: null,
        )).thenThrow(Exception('boom'));

    final ok = await notifier.update(name: 'x');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });
}
