import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/events/domain/entities/event.dart';
import 'package:tayyibt/features/search/domain/entities/search_page_result.dart';
import 'package:tayyibt/features/search/domain/entities/search_results.dart';
import 'package:tayyibt/features/search/domain/entities/search_user.dart';
import 'package:tayyibt/features/search/domain/repositories/search_repository.dart';
import 'package:tayyibt/features/search/domain/use_cases/search_use_case.dart';
import 'package:tayyibt/features/search/presentation/state/search_notifier.dart';
import 'package:tayyibt/features/search/presentation/state/search_state.dart';

class MockSearchRepository extends Mock implements SearchRepository {}

void main() {
  late MockSearchRepository repository;
  late SearchNotifier notifier;

  setUp(() {
    repository = MockSearchRepository();
    notifier = SearchNotifier(SearchUseCase(repository));
    // setQuery() fires an autocomplete lookup in the background for any
    // query >= 2 chars -- stub it so tests that only care about runSearch()
    // don't hit an unstubbed-mock error.
    when(() => repository.autocomplete(any())).thenAnswer((_) async => []);
  });

  test('runSearch does nothing for an empty query', () async {
    await notifier.runSearch();

    expect(notifier.state.hasSearched, isFalse);
    verifyNever(() => repository.search(
          q: any(named: 'q'),
          category: any(named: 'category'),
          gender: any(named: 'gender'),
          minAge: any(named: 'minAge'),
          maxAge: any(named: 'maxAge'),
          country: any(named: 'country'),
          city: any(named: 'city'),
        ));
  });

  test('runSearch populates results for the people tab by default', () async {
    notifier.setQuery('Amina');
    when(() => repository.search(
          q: 'Amina',
          category: 'users',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenAnswer((_) async => const SearchResults(users: [SearchUser(id: '1', fullName: 'Amina Test')]));

    await notifier.runSearch();

    expect(notifier.state.hasSearched, isTrue);
    expect(notifier.state.results.users.single.id, '1');
    expect(notifier.state.isLoading, isFalse);
  });

  test('runSearch sets an error and clears results on failure', () async {
    notifier.setQuery('x');
    when(() => repository.search(
          q: 'x',
          category: 'users',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenThrow(Exception('network error'));

    await notifier.runSearch();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.results.users, isEmpty);
  });

  test('setTab switches category and re-runs an already-active search', () async {
    notifier.setQuery('a');
    when(() => repository.search(
          q: 'a',
          category: any(named: 'category'),
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenAnswer((_) async => const SearchResults());
    await notifier.runSearch();

    await notifier.setTab(SearchTab.groups);

    expect(notifier.state.tab, SearchTab.groups);
    verify(() => repository.search(
          q: 'a',
          category: 'groups',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).called(1);
  });

  test('clear resets to the initial state', () async {
    notifier.setQuery('something');
    notifier.clear();

    expect(notifier.state.query, '');
    expect(notifier.state.hasSearched, isFalse);
  });

  test('setTab(pages) searches with category=pages and populates page results', () async {
    notifier.setQuery('a');
    when(() => repository.search(
          q: 'a',
          category: any(named: 'category'),
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenAnswer((_) async => const SearchResults());
    await notifier.runSearch();

    when(() => repository.search(
          q: 'a',
          category: 'pages',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenAnswer((_) async => const SearchResults(
          pages: [SearchPageResult(id: 'p1', name: 'Test Page', category: 'Education')],
        ));

    await notifier.setTab(SearchTab.pages);

    expect(notifier.state.tab, SearchTab.pages);
    expect(notifier.state.results.pages.single.id, 'p1');
    verify(() => repository.search(
          q: 'a',
          category: 'pages',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).called(1);
  });

  test('setTab(events) searches with category=events and populates event results', () async {
    notifier.setQuery('a');
    when(() => repository.search(
          q: 'a',
          category: any(named: 'category'),
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenAnswer((_) async => const SearchResults());
    await notifier.runSearch();

    when(() => repository.search(
          q: 'a',
          category: 'events',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).thenAnswer((_) async => SearchResults(
          events: [Event(id: 'e1', title: 'Test Event', startDate: DateTime(2026, 12, 1))],
        ));

    await notifier.setTab(SearchTab.events);

    expect(notifier.state.tab, SearchTab.events);
    expect(notifier.state.results.events.single.id, 'e1');
    verify(() => repository.search(
          q: 'a',
          category: 'events',
          gender: null,
          minAge: null,
          maxAge: null,
          country: null,
          city: null,
        )).called(1);
  });
}
