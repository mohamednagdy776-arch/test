import '../entities/subscription.dart';

abstract class PremiumRepository {
  Future<List<Subscription>> getMySubscriptions();

  // Null when the user has no active subscription -- confirmed live,
  // GET /subscriptions/me/active returns `data: null` in that case.
  Future<Subscription?> getActiveSubscription();

  Future<Subscription> createSubscription(String plan);

  Future<Subscription> cancelSubscription(String id);
}
