import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/get_post_use_case.dart';
import '../../domain/use_cases/get_comments_use_case.dart';
import '../../domain/use_cases/add_comment_use_case.dart';
import '../../domain/use_cases/update_comment_use_case.dart';
import '../../domain/use_cases/delete_comment_use_case.dart';
import '../../domain/use_cases/react_to_comment_use_case.dart';
import '../../domain/use_cases/get_post_reactions_use_case.dart';
import '../../domain/use_cases/toggle_post_reaction_use_case.dart';
import 'post_detail_state.dart';

class PostDetailNotifier extends StateNotifier<PostDetailState> {
  final String postId;
  final GetPostUseCase _getPost;
  final GetCommentsUseCase _getComments;
  final AddCommentUseCase _addComment;
  final UpdateCommentUseCase _updateComment;
  final DeleteCommentUseCase _deleteComment;
  final ReactToCommentUseCase _reactToComment;
  final GetPostReactionsUseCase _getReactions;
  final TogglePostReactionUseCase _toggleReaction;

  // No auto-load-on-construct -- callers trigger load() from initState, same
  // convention as FeedNotifier/GroupDetailNotifier.
  PostDetailNotifier(
    this.postId,
    this._getPost,
    this._getComments,
    this._addComment,
    this._updateComment,
    this._deleteComment,
    this._reactToComment,
    this._getReactions,
    this._toggleReaction,
  ) : super(const PostDetailState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final post = await _getPost(postId);
      final comments = await _getComments(postId);
      final reactions = await _getReactions(postId);
      state = state.copyWith(
        post: post,
        comments: comments,
        reactions: reactions,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل المنشور');
    }
  }

  Future<void> refresh() => load();

  // Every comment mutation below re-fetches the whole (already-nested)
  // comment tree instead of hand-mutating it in place -- the tree can be
  // several levels of replies deep and re-deriving it correctly client-side
  // isn't worth the bug surface for v1. Mirrors the web client's own
  // approach of invalidating and re-fetching ['comments', postId] after
  // every mutation rather than patching the cache locally.
  Future<void> _reloadComments() async {
    try {
      final comments = await _getComments(postId);
      state = state.copyWith(comments: comments);
    } catch (_) {
      // Keep the previous (now possibly stale) list rather than clearing it.
    }
  }

  Future<void> addComment(String content, {String? parentId}) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty) return;
    state = state.copyWith(isSubmittingComment: true, error: null);
    try {
      await _addComment(postId, content: trimmed, parentId: parentId);
      await _reloadComments();
      state = state.copyWith(isSubmittingComment: false);
    } catch (_) {
      state = state.copyWith(
          isSubmittingComment: false, error: 'تعذّر إضافة التعليق');
    }
  }

  Future<void> editComment(String commentId, String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty) return;
    try {
      await _updateComment(postId, commentId, content: trimmed);
      await _reloadComments();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تعديل التعليق');
    }
  }

  Future<void> deleteComment(String commentId) async {
    try {
      await _deleteComment(postId, commentId);
      await _reloadComments();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر حذف التعليق');
    }
  }

  Future<void> reactToComment(String commentId, String type) async {
    try {
      await _reactToComment(postId, commentId, type);
      await _reloadComments();
    } catch (_) {
      state = state.copyWith(error: 'تعذّر إضافة التفاعل');
    }
  }

  Future<void> toggleReaction(String type) async {
    final previous = state.reactions;
    try {
      await _toggleReaction(postId, type);
      final reactions = await _getReactions(postId);
      state = state.copyWith(reactions: reactions);
    } catch (_) {
      state = state.copyWith(reactions: previous, error: 'تعذّر إضافة التفاعل');
    }
  }
}
