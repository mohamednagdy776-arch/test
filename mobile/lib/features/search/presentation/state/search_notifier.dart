import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/search_results.dart';
import '../../domain/use_cases/search_use_case.dart';
import 'search_state.dart';

class SearchNotifier extends StateNotifier<SearchState> {
  final SearchUseCase _search;

  // No auto-search-on-construct -- consistent with every other notifier
  // here; the screen calls setQuery()/runSearch() from user interaction.
  SearchNotifier(this._search) : super(const SearchState());

  static const _categoryForTab = {
    SearchTab.people: 'users',
    SearchTab.groups: 'groups',
    SearchTab.pages: 'pages',
    SearchTab.events: 'events',
    SearchTab.posts: 'posts',
  };

  void setQuery(String q) {
    state = state.copyWith(query: q);
    if (q.trim().length >= 2) {
      _search.autocomplete(q.trim()).then((s) {
        if (state.query == q) state = state.copyWith(suggestions: s);
      });
    } else {
      state = state.copyWith(suggestions: []);
    }
  }

  Future<void> setTab(SearchTab tab) async {
    state = state.copyWith(tab: tab);
    if (state.hasSearched) await runSearch();
  }

  Future<void> runSearch({String? gender, int? minAge, int? maxAge, String? country, String? city}) async {
    final q = state.query.trim();
    if (q.isEmpty) return;
    state = state.copyWith(isLoading: true, hasSearched: true, error: null, suggestions: []);
    try {
      final results = await _search(
        q: q,
        category: _categoryForTab[state.tab],
        gender: gender,
        minAge: minAge,
        maxAge: maxAge,
        country: country,
        city: city,
      );
      state = state.copyWith(results: results, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تنفيذ البحث', results: const SearchResults());
    }
  }

  void clear() {
    state = const SearchState();
  }
}
