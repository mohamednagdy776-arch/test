import '../../domain/entities/comment.dart';
import '../../domain/entities/post.dart';
import '../../domain/entities/reaction_summary.dart';

class PostDetailState {
  final Post? post;
  final List<Comment> comments;
  final ReactionSummary reactions;
  final bool isLoading;
  final bool isSubmittingComment;
  final String? error;

  const PostDetailState({
    this.post,
    this.comments = const [],
    this.reactions = const ReactionSummary(),
    this.isLoading = false,
    this.isSubmittingComment = false,
    this.error,
  });

  PostDetailState copyWith({
    Post? post,
    List<Comment>? comments,
    ReactionSummary? reactions,
    bool? isLoading,
    bool? isSubmittingComment,
    String? error,
  }) {
    return PostDetailState(
      post: post ?? this.post,
      comments: comments ?? this.comments,
      reactions: reactions ?? this.reactions,
      isLoading: isLoading ?? this.isLoading,
      isSubmittingComment: isSubmittingComment ?? this.isSubmittingComment,
      error: error,
    );
  }
}
