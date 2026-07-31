// Mirrors backend/src/family/entities/family-relationship.entity.ts. Confirmed
// live: every /family/* endpoint returns the raw entity (or a raw array of
// them) directly -- NOT the app's usual {success,message,data} envelope, and
// unlike affiliates/premium there's no `data: null` case to special-case here
// (lists come back as `[]`, not `null`).
class FamilyRelationship {
  final String id;
  final String guardianUserId;
  final String wardUserId;
  final String relationshipType; // father | mother | brother | wali
  final String status; // pending | active | revoked
  final DateTime? acceptedAt;
  final DateTime? createdAt;

  const FamilyRelationship({
    required this.id,
    required this.guardianUserId,
    required this.wardUserId,
    required this.relationshipType,
    required this.status,
    this.acceptedAt,
    this.createdAt,
  });

  factory FamilyRelationship.fromJson(Map<String, dynamic> json) {
    return FamilyRelationship(
      id: json['id'] as String,
      guardianUserId: json['guardianUserId'] as String,
      wardUserId: json['wardUserId'] as String,
      relationshipType: json['relationshipType'] as String,
      status: json['status'] as String,
      acceptedAt: json['acceptedAt'] != null ? DateTime.tryParse(json['acceptedAt'] as String) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
    );
  }
}
