// Shared "minimal, secret-free" user shape used by received/sent interests
// and profile-views rows alike (backend/src/interests/interests.service.ts's
// publicUser()).
class PersonSummary {
  final String id;
  final String? username;
  final String? fullName;
  final String? avatarUrl;

  const PersonSummary({required this.id, this.username, this.fullName, this.avatarUrl});

  factory PersonSummary.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const PersonSummary(id: '');
    }
    return PersonSummary(
      id: json['id'] as String? ?? '',
      username: json['username'] as String?,
      fullName: json['fullName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  String get displayName => (fullName?.isNotEmpty ?? false) ? fullName! : (username?.isNotEmpty ?? false) ? username! : 'مستخدم';
}
