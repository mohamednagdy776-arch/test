import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/use_cases/get_pages_use_case.dart';
import '../../domain/use_cases/manage_page_use_case.dart';
import 'pages_list_state.dart';

class PagesListNotifier extends StateNotifier<PagesListState> {
  final GetPagesUseCase _getPages;
  final ManagePageUseCase _manage;

  // No auto-load-on-construct -- same lesson as every other notifier here.
  PagesListNotifier(this._getPages, this._manage) : super(const PagesListState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final my = await _getPages.myPages();
      final created = await _getPages.createdPages();
      final discover = await _getPages.discover(page: 1, limit: 20, category: state.category);
      final suggested = await _getPages.suggested();
      state = state.copyWith(
        myPages: my,
        createdPages: created,
        discoverPages: discover.items,
        discoverPage: 1,
        hasMoreDiscover: discover.hasMore,
        suggested: suggested,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الصفحات');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> loadMoreDiscover() async {
    if (!state.hasMoreDiscover || state.isLoadingMore) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final nextPage = state.discoverPage + 1;
      final discover = await _getPages.discover(page: nextPage, limit: 20, category: state.category);
      final merged = {for (final p in state.discoverPages) p.id: p};
      for (final p in discover.items) {
        merged[p.id] = p;
      }
      state = state.copyWith(
        discoverPages: merged.values.toList(),
        discoverPage: nextPage,
        hasMoreDiscover: discover.hasMore,
        isLoadingMore: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  Future<void> setCategory(String? category) async {
    state = state.copyWith(category: category, clearCategory: category == null);
    state = state.copyWith(isLoading: true);
    try {
      final discover = await _getPages.discover(page: 1, limit: 20, category: category);
      state = state.copyWith(discoverPages: discover.items, discoverPage: 1, hasMoreDiscover: discover.hasMore, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الصفحات');
    }
  }

  Future<void> search(String query) async {
    state = state.copyWith(searchQuery: query);
    if (query.trim().length < 2) {
      state = state.copyWith(searchResults: []);
      return;
    }
    state = state.copyWith(isSearching: true);
    try {
      final results = await _getPages.search(query.trim());
      state = state.copyWith(searchResults: results, isSearching: false);
    } catch (_) {
      state = state.copyWith(isSearching: false);
    }
  }

  Future<void> toggleFollow(String pageId) async {
    final following = state.isFollowing(pageId);
    state = state.copyWith(pendingIds: {...state.pendingIds, pageId});
    try {
      if (following) {
        await _manage.unfollow(pageId);
      } else {
        await _manage.follow(pageId);
      }
      await loadInitial();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تحديث المتابعة');
    } finally {
      state = state.copyWith(pendingIds: state.pendingIds.where((e) => e != pageId).toSet());
    }
  }

  Future<bool> create({
    required String name,
    String? description,
    String? category,
    String privacy = 'public',
    XFile? profilePhoto,
    XFile? coverPhoto,
  }) async {
    state = state.copyWith(isCreating: true, error: null);
    try {
      await _manage.create(
        name: name,
        description: description,
        category: category,
        privacy: privacy,
        profilePhoto: profilePhoto,
        coverPhoto: coverPhoto,
      );
      await loadInitial();
      state = state.copyWith(isCreating: false);
      return true;
    } catch (_) {
      state = state.copyWith(isCreating: false, error: 'تعذّر إنشاء الصفحة');
      return false;
    }
  }
}
