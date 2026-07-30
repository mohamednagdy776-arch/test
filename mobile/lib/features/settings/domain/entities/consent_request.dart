// Mirrors backend/src/consent/entities/consent-request.entity.ts -- guardian/
// medical data-sharing consent requests (web/src/app/(main)/settings/consent).
enum ConsentStatus { pending, accepted, declined, expired, revoked, unknown }

ConsentStatus consentStatusFromString(String? value) {
  switch (value) {
    case 'pending':
      return ConsentStatus.pending;
    case 'accepted':
      return ConsentStatus.accepted;
    case 'declined':
      return ConsentStatus.declined;
    case 'expired':
      return ConsentStatus.expired;
    case 'revoked':
      return ConsentStatus.revoked;
    default:
      return ConsentStatus.unknown;
  }
}

class ConsentRequestItem {
  final String id;
  final String requesterUserId;
  final String targetUserId;
  final String consentType; // 'medical_share' | 'genetic_share'
  final ConsentStatus status;
  final String? requestedAt;
  final String? respondedAt;
  final String? expiresAt;

  const ConsentRequestItem({
    required this.id,
    required this.requesterUserId,
    required this.targetUserId,
    required this.consentType,
    required this.status,
    this.requestedAt,
    this.respondedAt,
    this.expiresAt,
  });

  factory ConsentRequestItem.fromJson(Map<String, dynamic> json) {
    return ConsentRequestItem(
      id: json['id'] as String? ?? '',
      requesterUserId: json['requesterUserId'] as String? ?? '',
      targetUserId: json['targetUserId'] as String? ?? '',
      consentType: json['consentType'] as String? ?? '',
      status: consentStatusFromString(json['status'] as String?),
      requestedAt: json['requestedAt'] as String?,
      respondedAt: json['respondedAt'] as String?,
      expiresAt: json['expiresAt'] as String?,
    );
  }
}
