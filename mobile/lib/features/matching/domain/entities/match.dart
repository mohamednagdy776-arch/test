class Match {
  final String id;
  final String user1Id;
  final String user2Id;
  final double score;
  final String status;
  final String? otherUserName;
  final String? otherUserAvatar;
  final DateTime createdAt;

  const Match({
    required this.id,
    required this.user1Id,
    required this.user2Id,
    required this.score,
    required this.status,
    this.otherUserName,
    this.otherUserAvatar,
    required this.createdAt,
  });

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      id: json['id'] as String,
      user1Id: json['user1Id'] as String,
      user2Id: json['user2Id'] as String,
      score: (json['score'] as num).toDouble(),
      status: json['status'] as String,
      otherUserName: json['otherUserName'] as String?,
      otherUserAvatar: json['otherUserAvatar'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
