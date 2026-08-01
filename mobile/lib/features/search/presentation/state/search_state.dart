import '../../domain/entities/search_results.dart';
import '../../domain/entities/search_suggestion.dart';

enum SearchTab { people, groups, pages, events, posts }

class SearchState {
  final String query;
  final SearchTab tab;
  final SearchResults results;
  final List<SearchSuggestion> suggestions;
  final bool isLoading;
  final bool hasSearched;
  final String? error;

  const SearchState({
    this.query = '',
    this.tab = SearchTab.people,
    this.results = const SearchResults(),
    this.suggestions = const [],
    this.isLoading = false,
    this.hasSearched = false,
    this.error,
  });

  SearchState copyWith({
    String? query,
    SearchTab? tab,
    SearchResults? results,
    List<SearchSuggestion>? suggestions,
    bool? isLoading,
    bool? hasSearched,
    String? error,
  }) {
    return SearchState(
      query: query ?? this.query,
      tab: tab ?? this.tab,
      results: results ?? this.results,
      suggestions: suggestions ?? this.suggestions,
      isLoading: isLoading ?? this.isLoading,
      hasSearched: hasSearched ?? this.hasSearched,
      error: error,
    );
  }
}
