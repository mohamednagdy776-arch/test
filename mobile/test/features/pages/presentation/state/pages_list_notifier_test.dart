import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/pages/domain/entities/page.dart';
import 'package:tayyibt/features/pages/domain/repositories/pages_repository.dart';
import 'package:tayyibt/features/pages/domain/use_cases/get_pages_use_case.dart';
import 'package:tayyibt/features/pages/domain/use_cases/manage_page_use_case.dart';
import 'package:tayyibt/features/pages/presentation/state/pages_list_notifier.dart';

class MockPagesRepository extends Mock implements PagesRepository {}

CommunityPage _page(String id, {String name = ''}) =>
    CommunityPage(id: id, username: 'page-$id', name: name.isEmpty ? 'Page $id' : name);

void main() {
  late MockPagesRepository repository;
  late PagesListNotifier notifier;

  setUp(() {
    repository = MockPagesRepository();
    notifier = PagesListNotifier(GetPagesUseCase(repository), ManagePageUseCase(repository));
  });

  test('loadInitial populates my/created/discover/suggested', () async {
    when(() => repository.getMyPages()).thenAnswer((_) async => [_page('1')]);
    when(() => repository.getCreatedPages()).thenAnswer((_) async => [_page('2')]);
    when(() => repository.getPages(page: 1, limit: 20, category: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_page('3'), _page('4')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getSuggestedPages(limit: 5)).thenAnswer((_) async => [_page('5')]);

    await notifier.loadInitial();

    expect(notifier.state.myPages.map((p) => p.id), ['1']);
    expect(notifier.state.createdPages.map((p) => p.id), ['2']);
    expect(notifier.state.discoverPages.map((p) => p.id), ['3', '4']);
    expect(notifier.state.suggested.map((p) => p.id), ['5']);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getMyPages()).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('isFollowing reflects membership in myPages', () async {
    when(() => repository.getMyPages()).thenAnswer((_) async => [_page('1')]);
    when(() => repository.getCreatedPages()).thenAnswer((_) async => []);
    when(() => repository.getPages(page: 1, limit: 20, category: null)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getSuggestedPages(limit: 5)).thenAnswer((_) async => []);

    await notifier.loadInitial();

    expect(notifier.state.isFollowing('1'), isTrue);
    expect(notifier.state.isFollowing('999'), isFalse);
  });

  test('toggleFollow follows when not already following, then reloads', () async {
    when(() => repository.getMyPages()).thenAnswer((_) async => []);
    when(() => repository.getCreatedPages()).thenAnswer((_) async => []);
    when(() => repository.getPages(page: 1, limit: 20, category: null)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getSuggestedPages(limit: 5)).thenAnswer((_) async => []);
    when(() => repository.follow('p1')).thenAnswer((_) async => _page('p1'));

    await notifier.toggleFollow('p1');

    verifyInOrder([
      () => repository.follow('p1'),
      () => repository.getMyPages(),
    ]);
    verifyNever(() => repository.unfollow(any()));
    expect(notifier.state.pendingIds, isEmpty);
  });

  test('toggleFollow unfollows when already following', () async {
    when(() => repository.getMyPages()).thenAnswer((_) async => [_page('p1')]);
    when(() => repository.getCreatedPages()).thenAnswer((_) async => []);
    when(() => repository.getPages(page: 1, limit: 20, category: null)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getSuggestedPages(limit: 5)).thenAnswer((_) async => []);
    // Seed state.myPages via an initial load so isFollowing('p1') is true.
    await notifier.loadInitial();
    when(() => repository.unfollow('p1')).thenAnswer((_) async {});

    await notifier.toggleFollow('p1');

    verify(() => repository.unfollow('p1')).called(1);
    verifyNever(() => repository.follow(any()));
  });

  test('search below 2 chars clears results without calling the repository', () async {
    await notifier.search('a');

    expect(notifier.state.searchResults, isEmpty);
    verifyNever(() => repository.searchPages(any()));
  });

  test('search sets results for a valid query', () async {
    when(() => repository.searchPages('test')).thenAnswer((_) async => [_page('s1')]);

    await notifier.search('test');

    expect(notifier.state.searchResults.single.id, 's1');
    expect(notifier.state.isSearching, isFalse);
  });

  test('create returns false and sets an error on failure', () async {
    when(() => repository.createPage(
          name: 'x',
          description: null,
          category: null,
          privacy: 'public',
          website: null,
          contactInfo: null,
          location: null,
          hours: null,
          profilePhoto: null,
          coverPhoto: null,
        )).thenThrow(Exception('boom'));

    final ok = await notifier.create(name: 'x');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });
}
