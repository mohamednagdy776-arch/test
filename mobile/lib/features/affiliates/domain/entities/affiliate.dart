// Mirrors backend/src/affiliates/entities/affiliate.entity.ts. commissionBalance
// comes back over the wire as a string (e.g. "0" / "0.00" -- Postgres
// `decimal` columns serialize as strings via TypeORM), confirmed live, so it
// is parsed defensively rather than cast.
class Affiliate {
  final String id;
  final String referralCode;
  final int totalReferred;
  final int totalMarriages;
  final double commissionBalance;

  const Affiliate({
    required this.id,
    required this.referralCode,
    required this.totalReferred,
    required this.totalMarriages,
    required this.commissionBalance,
  });

  factory Affiliate.fromJson(Map<String, dynamic> json) {
    return Affiliate(
      id: json['id'] as String,
      referralCode: json['referralCode'] as String? ?? '',
      totalReferred: (json['totalReferred'] as num?)?.toInt() ?? 0,
      totalMarriages: (json['totalMarriages'] as num?)?.toInt() ?? 0,
      commissionBalance: double.tryParse('${json['commissionBalance'] ?? 0}') ?? 0,
    );
  }
}
