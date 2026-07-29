import 'person_summary.dart';

// GET /users/me/profile-views' row shape (backend/src/interests/entities/
// profile-view.entity.ts) -- paginated, one row per (viewer, profile) pair.
class ProfileViewRow {
  final String id;
  final DateTime viewedAt;
  final PersonSummary user;

  const ProfileViewRow({required this.id, required this.viewedAt, required this.user});

  factory ProfileViewRow.fromJson(Map<String, dynamic> json) {
    return ProfileViewRow(
      id: json['id'] as String,
      viewedAt: DateTime.parse(json['viewedAt'] as String),
      user: PersonSummary.fromJson(json['user'] as Map<String, dynamic>?),
    );
  }
}
