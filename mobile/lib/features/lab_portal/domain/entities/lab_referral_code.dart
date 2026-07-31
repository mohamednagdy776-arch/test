class LabReferralCode {
  final String id;
  final String labId;
  final String code;
  final DateTime expiresAt;
  final DateTime? usedAt;

  const LabReferralCode({
    required this.id,
    required this.labId,
    required this.code,
    required this.expiresAt,
    this.usedAt,
  });

  bool get isUsed => usedAt != null;
  bool get isExpired => !isUsed && expiresAt.isBefore(DateTime.now());
  bool get isActive => !isUsed && !isExpired;

  factory LabReferralCode.fromJson(Map<String, dynamic> json) {
    return LabReferralCode(
      id: json['id'] as String,
      labId: json['labId'] as String,
      code: json['code'] as String,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
      usedAt: json['usedAt'] != null ? DateTime.tryParse(json['usedAt'] as String) : null,
    );
  }
}
