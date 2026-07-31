// Mirrors backend/src/subscriptions/entities/subscription.entity.ts. Field
// names confirmed live via curl against POST /subscriptions and GET
// /subscriptions/me/active -- the response uses `plan`/`startDate`/`endDate`,
// NOT `planId`/`currentPeriodEnd` as web's upgrade/page.tsx reads them (a
// live web bug: activeSub?.planId is always undefined there, so web's own
// "current plan" badge never highlights premium/family). Don't copy that
// mistake here.
class Subscription {
  final String id;
  final String plan; // 'free' | 'premium' | 'family'
  final DateTime startDate;
  final DateTime endDate;
  final String status; // 'active' | 'cancelled'

  const Subscription({
    required this.id,
    required this.plan,
    required this.startDate,
    required this.endDate,
    required this.status,
  });

  bool get isActive => status == 'active';

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      plan: json['plan'] as String? ?? 'free',
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      status: json['status'] as String? ?? 'active',
    );
  }
}
