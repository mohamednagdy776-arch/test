import '../entities/subscription.dart';
import '../repositories/premium_repository.dart';

class PremiumUseCase {
  final PremiumRepository _repository;
  const PremiumUseCase(this._repository);

  Future<List<Subscription>> getMySubscriptions() => _repository.getMySubscriptions();

  Future<Subscription?> getActiveSubscription() => _repository.getActiveSubscription();

  Future<Subscription> createSubscription(String plan) => _repository.createSubscription(plan);

  Future<Subscription> cancelSubscription(String id) => _repository.cancelSubscription(id);
}
