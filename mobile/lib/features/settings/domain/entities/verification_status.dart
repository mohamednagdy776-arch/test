// Mirrors backend/src/verification/verification.controller.ts's
// GET /verification/identity/status.
class IdentityVerificationStatus {
  final String status; // 'unverified' | 'pending' | 'approved' | 'rejected'
  final String? rejectionReason;

  const IdentityVerificationStatus({
    this.status = 'unverified',
    this.rejectionReason,
  });

  factory IdentityVerificationStatus.fromJson(Map<String, dynamic> json) {
    return IdentityVerificationStatus(
      status: json['status'] as String? ?? 'unverified',
      rejectionReason: json['rejectionReason'] as String?,
    );
  }

  bool get canSubmit => status == 'unverified' || status == 'rejected';
}
