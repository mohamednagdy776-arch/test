import 'person_summary.dart';

// GET /users/me/interests/received and /sent's shared row shape
// (backend/src/interests/interests.controller.ts).
class InterestRow {
  final String id;
  final String status; // 'pending' | 'mutual' (withdrawn rows are filtered server-side)
  final DateTime createdAt;
  final PersonSummary user;

  const InterestRow({
    required this.id,
    required this.status,
    required this.createdAt,
    required this.user,
  });

  factory InterestRow.fromJson(Map<String, dynamic> json) {
    return InterestRow(
      id: json['id'] as String,
      status: json['status'] as String? ?? 'pending',
      createdAt: DateTime.parse(json['createdAt'] as String),
      user: PersonSummary.fromJson(json['user'] as Map<String, dynamic>?),
    );
  }
}
