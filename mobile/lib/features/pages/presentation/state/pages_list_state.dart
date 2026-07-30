import '../../domain/entities/page.dart';

class PagesListState {
  final List<Page> myPages; // followed pages (GET /pages/my)
  final List<Page> createdPages;
  final List<Page> discoverPages;
  final List<Page> suggested;
  final List<Page> searchResults;
  final String searchQuery;
  final String? category;
  final int discoverPage;
  final bool hasMoreDiscover;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isSearching;
  final bool isCreating;
  final String? error;
  final Set<String> pendingIds;

  const PagesListState({
    this.myPages = const [],
    this.createdPages = const [],
    this.discoverPages = const [],
    this.suggested = const [],
    this.searchResults = const [],
    this.searchQuery = '',
    this.category,
    this.discoverPage = 1,
    this.hasMoreDiscover = false,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isSearching = false,
    this.isCreating = false,
    this.error,
    this.pendingIds = const {},
  });

  bool isFollowing(String pageId) => myPages.any((p) => p.id == pageId);

  PagesListState copyWith({
    List<Page>? myPages,
    List<Page>? createdPages,
    List<Page>? discoverPages,
    List<Page>? suggested,
    List<Page>? searchResults,
    String? searchQuery,
    String? category,
    bool clearCategory = false,
    int? discoverPage,
    bool? hasMoreDiscover,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isSearching,
    bool? isCreating,
    String? error,
    Set<String>? pendingIds,
  }) {
    return PagesListState(
      myPages: myPages ?? this.myPages,
      createdPages: createdPages ?? this.createdPages,
      discoverPages: discoverPages ?? this.discoverPages,
      suggested: suggested ?? this.suggested,
      searchResults: searchResults ?? this.searchResults,
      searchQuery: searchQuery ?? this.searchQuery,
      category: clearCategory ? null : (category ?? this.category),
      discoverPage: discoverPage ?? this.discoverPage,
      hasMoreDiscover: hasMoreDiscover ?? this.hasMoreDiscover,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isSearching: isSearching ?? this.isSearching,
      isCreating: isCreating ?? this.isCreating,
      error: error,
      pendingIds: pendingIds ?? this.pendingIds,
    );
  }
}
