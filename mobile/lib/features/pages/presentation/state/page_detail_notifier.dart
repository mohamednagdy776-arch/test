import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/use_cases/page_detail_use_case.dart';
import '../../domain/use_cases/manage_page_use_case.dart';
import '../../domain/use_cases/page_posts_use_case.dart';
import 'page_detail_state.dart';

class PageDetailNotifier extends StateNotifier<PageDetailState> {
  final String pageId;
  final PageDetailUseCase _detail;
  final ManagePageUseCase _manage;
  final PagePostsUseCase _posts;

  // No auto-load-on-construct -- callers trigger load() from initState.
  PageDetailNotifier(this.pageId, this._detail, this._manage, this._posts) : super(const PageDetailState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final page = await _detail(pageId);
      final postsPage = await _posts.getPosts(pageId, page: 1, limit: 20);
      state = state.copyWith(
        page: page,
        posts: postsPage.items,
        postsPage: 1,
        hasMorePosts: postsPage.hasMore,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل الصفحة');
    }
  }

  Future<void> refresh() => load();

  Future<void> loadMorePosts() async {
    if (!state.hasMorePosts || state.isLoadingMorePosts) return;
    state = state.copyWith(isLoadingMorePosts: true);
    try {
      final nextPage = state.postsPage + 1;
      final postsPage = await _posts.getPosts(pageId, page: nextPage, limit: 20);
      state = state.copyWith(
        posts: [...state.posts, ...postsPage.items],
        postsPage: nextPage,
        hasMorePosts: postsPage.hasMore,
        isLoadingMorePosts: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMorePosts: false);
    }
  }

  Future<void> toggleFollow() async {
    final page = state.page;
    if (page == null) return;
    state = state.copyWith(isFollowPending: true, error: null);
    try {
      if (page.isFollowing == true) {
        await _manage.unfollow(pageId);
      } else {
        await _manage.follow(pageId);
      }
      await load();
    } catch (_) {
      state = state.copyWith(isFollowPending: false, error: 'تعذّر تحديث المتابعة');
      return;
    }
    state = state.copyWith(isFollowPending: false);
  }

  Future<void> toggleLike() async {
    final page = state.page;
    if (page == null) return;
    state = state.copyWith(isLikePending: true, error: null);
    try {
      if (page.isLiked == true) {
        await _manage.unlike(pageId);
      } else {
        await _manage.like(pageId);
      }
      await load();
    } catch (_) {
      state = state.copyWith(isLikePending: false, error: 'تعذّر تحديث الإعجاب');
      return;
    }
    state = state.copyWith(isLikePending: false);
  }

  Future<void> createPost(String content) async {
    if (content.trim().isEmpty) return;
    state = state.copyWith(isPosting: true, error: null);
    try {
      final post = await _posts.createPost(pageId, content: content.trim());
      state = state.copyWith(posts: [post, ...state.posts], isPosting: false);
    } catch (_) {
      state = state.copyWith(isPosting: false, error: 'تعذّر نشر المنشور');
    }
  }

  // Owner-only edit (name/description/category + avatar/cover) -- mirrors
  // web's edit modal on the page detail screen (#372).
  Future<bool> update({
    String? name,
    String? description,
    String? category,
    XFile? profilePhoto,
    XFile? coverPhoto,
  }) async {
    state = state.copyWith(isUpdating: true, error: null);
    try {
      final updated = await _manage.update(
        pageId,
        name: name,
        description: description,
        category: category,
        profilePhoto: profilePhoto,
        coverPhoto: coverPhoto,
      );
      state = state.copyWith(page: updated, isUpdating: false);
      return true;
    } catch (_) {
      state = state.copyWith(isUpdating: false, error: 'تعذّر تعديل الصفحة');
      return false;
    }
  }
}
