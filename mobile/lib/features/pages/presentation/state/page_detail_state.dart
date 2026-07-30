import '../../domain/entities/page.dart';
import '../../../posts/domain/entities/post.dart';

class PageDetailState {
  final Page? page;
  final List<Post> posts;
  final int postsPage;
  final bool hasMorePosts;
  final bool isLoading;
  final bool isLoadingMorePosts;
  final bool isFollowPending;
  final bool isLikePending;
  final bool isPosting;
  final bool isUpdating;
  final String? error;

  const PageDetailState({
    this.page,
    this.posts = const [],
    this.postsPage = 1,
    this.hasMorePosts = false,
    this.isLoading = false,
    this.isLoadingMorePosts = false,
    this.isFollowPending = false,
    this.isLikePending = false,
    this.isPosting = false,
    this.isUpdating = false,
    this.error,
  });

  PageDetailState copyWith({
    Page? page,
    List<Post>? posts,
    int? postsPage,
    bool? hasMorePosts,
    bool? isLoading,
    bool? isLoadingMorePosts,
    bool? isFollowPending,
    bool? isLikePending,
    bool? isPosting,
    bool? isUpdating,
    String? error,
  }) {
    return PageDetailState(
      page: page ?? this.page,
      posts: posts ?? this.posts,
      postsPage: postsPage ?? this.postsPage,
      hasMorePosts: hasMorePosts ?? this.hasMorePosts,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMorePosts: isLoadingMorePosts ?? this.isLoadingMorePosts,
      isFollowPending: isFollowPending ?? this.isFollowPending,
      isLikePending: isLikePending ?? this.isLikePending,
      isPosting: isPosting ?? this.isPosting,
      isUpdating: isUpdating ?? this.isUpdating,
      error: error,
    );
  }
}
