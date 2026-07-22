import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/post.dart';
import '../../domain/use_cases/get_feed_use_case.dart';
import '../../domain/use_cases/delete_post_use_case.dart';
import 'feed_state.dart';

class FeedNotifier extends StateNotifier<FeedState> {
  final GetFeedUseCase _getFeed;
  final DeletePostUseCase _deletePost;

  // No auto-load-on-construct: callers (feed_screen.dart's initState) trigger
  // loadInitial() explicitly. A constructor side-effect made this untestable
  // -- stubbing the mock always raced against construction.
  FeedNotifier(this._getFeed, this._deletePost) : super(const FeedState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final page = await _getFeed(cursor: null);
      state = FeedState(items: page.items, cursor: page.cursor, hasMore: page.hasMore, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'فشل تحميل المنشورات');
    }
  }

  Future<void> refresh() => loadInitial();

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.isLoading) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final page = await _getFeed(cursor: state.cursor);
      state = state.copyWith(
        items: _appendDeduped(state.items, page.items),
        cursor: page.cursor,
        hasMore: page.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  // Guards against duplicate items across pages -- e.g. a stale in-flight
  // loadMore() landing after a refresh() reset the cursor, or two posts
  // sharing an exact createdAt at a page boundary.
  List<Post> _appendDeduped(List<Post> existing, List<Post> incoming) {
    final seenIds = existing.map((p) => p.id).toSet();
    final deduped = incoming.where((p) => !seenIds.contains(p.id));
    return [...existing, ...deduped];
  }

  void prepend(Post post) {
    state = state.copyWith(items: [post, ...state.items]);
  }

  Future<void> delete(String postId) async {
    final previous = state.items;
    state = state.copyWith(items: previous.where((p) => p.id != postId).toList());
    try {
      await _deletePost(postId);
    } catch (e) {
      state = state.copyWith(items: previous, error: 'تعذّر حذف المنشور');
    }
  }
}
