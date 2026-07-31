import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/premium_remote_data_source.dart';
import '../../data/repositories/premium_repository_impl.dart';
import '../../domain/repositories/premium_repository.dart';
import '../../domain/use_cases/premium_use_case.dart';
import '../state/premium_notifier.dart';
import '../state/premium_state.dart';
import '../../../../core/api/dio_client.dart';

final premiumRemoteDataSourceProvider = Provider((ref) {
  return PremiumRemoteDataSource(DioClient.create());
});

final premiumRepositoryProvider = Provider<PremiumRepository>((ref) {
  return PremiumRepositoryImpl(ref.read(premiumRemoteDataSourceProvider));
});

final premiumUseCaseProvider = Provider((ref) {
  return PremiumUseCase(ref.read(premiumRepositoryProvider));
});

final premiumProvider = StateNotifierProvider<PremiumNotifier, PremiumState>((ref) {
  return PremiumNotifier(ref.read(premiumUseCaseProvider));
});
