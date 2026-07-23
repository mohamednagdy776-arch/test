// Matches GET /matches's list-item shape (curl-verified against the live
// VPS) -- flattened otherUserId/otherUserName/otherUserAvatar fields, unlike
// GET /matches/:id which nests full user1/user2 objects instead. The list
// shape is the only one this app needs: matches_screen.dart uses it
// directly, and match_detail_screen.dart is navigated to with the already-
// fetched Match instance rather than re-fetching by id in a different shape.
class Match {
  final String id;
  final String otherUserId;
  final String? otherUserName;
  final String? otherUserAvatar;
  final double score;
  final Map<String, double>? breakdown;
  final String status;
  final DateTime createdAt;

  const Match({
    required this.id,
    required this.otherUserId,
    this.otherUserName,
    this.otherUserAvatar,
    required this.score,
    this.breakdown,
    required this.status,
    required this.createdAt,
  });

  Match copyWith({String? status}) {
    return Match(
      id: id,
      otherUserId: otherUserId,
      otherUserName: otherUserName,
      otherUserAvatar: otherUserAvatar,
      score: score,
      breakdown: breakdown,
      status: status ?? this.status,
      createdAt: createdAt,
    );
  }

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      id: json['id'] as String,
      otherUserId: json['otherUserId'] as String,
      otherUserName: json['otherUserName'] as String?,
      otherUserAvatar: json['otherUserAvatar'] as String?,
      score: (json['score'] as num).toDouble(),
      breakdown: (json['breakdown'] as Map<String, dynamic>?)?.map(
        (k, v) => MapEntry(k, (v as num).toDouble()),
      ),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
