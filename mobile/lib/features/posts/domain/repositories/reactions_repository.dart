import '../entities/reaction_summary.dart';

abstract class ReactionsRepository {
  /// Toggles the viewer's reaction on a post; returns the new reaction type,
  /// or null if the toggle removed it.
  Future<String?> reactToPost(String postId, String type);
  Future<ReactionSummary> getReactions(String postId);
  Future<String?> getMyReaction(String postId);

  /// GET .../breakdown -- a strict subset of getReactions()'s payload (see
  /// ReactionSummary's doc comment). Kept for API-surface completeness, not
  /// called from the post detail screen.
  Future<Map<String, int>> getBreakdown(String postId);
}
