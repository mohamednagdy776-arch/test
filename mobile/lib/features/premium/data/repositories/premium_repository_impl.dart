import '../../domain/entities/subscription.dart';
import '../../domain/repositories/premium_repository.dart';
import '../data_sources/premium_remote_data_source.dart';

class PremiumRepositoryImpl implements PremiumRepository {
  final PremiumRemoteDataSource _remoteDataSource;
  const PremiumRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<Subscription>> getMySubscriptions() async {
    final list = await _remoteDataSource.getMySubscriptions();
    return list.map((e) => Subscription.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Subscription?> getActiveSubscription() async {
    final json = await _remoteDataSource.getActiveSubscription();
    return json == null ? null : Subscription.fromJson(json);
  }

  @override
  Future<Subscription> createSubscription(String plan) async {
    final json = await _remoteDataSource.createSubscription(plan);
    return Subscription.fromJson(json);
  }

  @override
  Future<Subscription> cancelSubscription(String id) async {
    final json = await _remoteDataSource.cancelSubscription(id);
    return Subscription.fromJson(json);
  }
}
