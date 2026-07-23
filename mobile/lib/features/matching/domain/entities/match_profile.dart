// GET /matches/profile/:userId's shape (curl-verified) -- a purpose-built
// compatibility view distinct from the plain Match list item: full profile
// fields + human-readable AI-generated match reasons.
class MatchProfile {
  final double matchScore;
  final List<String> matchReasons;
  final String userId;
  final String? firstName;
  final String? lastName;
  final int? age;
  final String? city;
  final String? country;
  final String? bio;
  final String? education;
  final String? occupation;
  final String? sect;
  final String? lifestyle;

  const MatchProfile({
    required this.matchScore,
    required this.matchReasons,
    required this.userId,
    this.firstName,
    this.lastName,
    this.age,
    this.city,
    this.country,
    this.bio,
    this.education,
    this.occupation,
    this.sect,
    this.lifestyle,
  });

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();

  factory MatchProfile.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? const {};
    return MatchProfile(
      matchScore: (json['matchScore'] as num).toDouble(),
      matchReasons: (json['matchReasons'] as List<dynamic>?)?.cast<String>() ?? const [],
      userId: user['id'] as String? ?? '',
      firstName: user['firstName'] as String?,
      lastName: user['lastName'] as String?,
      age: user['age'] as int?,
      city: user['city'] as String?,
      country: user['country'] as String?,
      bio: user['bio'] as String?,
      education: user['education'] as String?,
      occupation: user['occupation'] as String?,
      sect: user['sect'] as String?,
      lifestyle: user['lifestyle'] as String?,
    );
  }
}
