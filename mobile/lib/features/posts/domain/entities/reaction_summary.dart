// A single reaction row -- backend/src/reactions/entities/reaction.entity.ts,
// as embedded in GET posts/:postId/reactions's `reactions` array.
class ReactionEntry {
  final String id;
  final String type;
  final String userId;
  final String userName;
  final String? userAvatarUrl;

  const ReactionEntry({
    required this.id,
    required this.type,
    required this.userId,
    required this.userName,
    this.userAvatarUrl,
  });

  factory ReactionEntry.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final profile = user?['profile'] as Map<String, dynamic>?;
    final firstLast =
        '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();
    return ReactionEntry(
      id: json['id'] as String,
      type: json['type'] as String,
      userId: (json['userId'] as String?) ?? (user?['id'] as String?) ?? '',
      userName: (profile?['fullName'] as String?)?.trim().isNotEmpty == true
          ? profile!['fullName'] as String
          : (firstLast.isNotEmpty
              ? firstLast
              : (user?['fullName'] as String? ?? 'مستخدم')),
      userAvatarUrl: profile?['avatarUrl'] as String?,
    );
  }
}

// GET posts/:postId/reactions's live shape (backend/src/reactions/services/
// reactions.service.ts's findByPost): { reactions, counts, total,
// userReaction }. GET .../breakdown returns only the bare `counts` map with
// no total/userReaction/list, so it's a strict subset of this -- it's still
// wired up in the data layer for API-surface completeness (see
// ReactionsRemoteDataSource.getBreakdown) but never called from the post
// detail screen, same simplification the web client makes: PostCard's
// ReactionDisplay only ever calls useReactions(), never a separate
// breakdown query.
class ReactionSummary {
  final Map<String, int> counts;
  final int total;
  final String? userReaction;
  final List<ReactionEntry> reactions;

  const ReactionSummary({
    this.counts = const {},
    this.total = 0,
    this.userReaction,
    this.reactions = const [],
  });

  factory ReactionSummary.fromJson(Map<String, dynamic> json) {
    final countsJson = json['counts'] as Map<String, dynamic>? ?? const {};
    return ReactionSummary(
      counts: countsJson.map((k, v) => MapEntry(k, v as int)),
      total: json['total'] as int? ?? 0,
      userReaction: json['userReaction'] as String?,
      reactions: (json['reactions'] as List<dynamic>? ?? const [])
          .map((e) => ReactionEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
