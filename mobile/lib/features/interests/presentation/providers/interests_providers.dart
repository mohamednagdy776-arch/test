import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/interests_remote_data_source.dart';
import '../../data/repositories/interests_repository_impl.dart';
import '../../domain/repositories/interests_repository.dart';
import '../../domain/use_cases/get_received_interests_use_case.dart';
import '../../domain/use_cases/get_sent_interests_use_case.dart';
import '../../domain/use_cases/get_profile_views_use_case.dart';
import '../../domain/use_cases/send_interest_use_case.dart';
import '../../domain/use_cases/withdraw_interest_use_case.dart';
import '../state/interests_notifier.dart';
import '../state/interests_state.dart';
import '../../../../core/api/dio_client.dart';

final interestsRemoteDataSourceProvider = Provider((ref) {
  return InterestsRemoteDataSource(DioClient.create());
});

final interestsRepositoryProvider = Provider<InterestsRepository>((ref) {
  return InterestsRepositoryImpl(ref.read(interestsRemoteDataSourceProvider));
});

final getReceivedInterestsUseCaseProvider = Provider((ref) {
  return GetReceivedInterestsUseCase(ref.read(interestsRepositoryProvider));
});

final getSentInterestsUseCaseProvider = Provider((ref) {
  return GetSentInterestsUseCase(ref.read(interestsRepositoryProvider));
});

final getProfileViewsUseCaseProvider = Provider((ref) {
  return GetProfileViewsUseCase(ref.read(interestsRepositoryProvider));
});

final sendInterestUseCaseProvider = Provider((ref) {
  return SendInterestUseCase(ref.read(interestsRepositoryProvider));
});

final withdrawInterestUseCaseProvider = Provider((ref) {
  return WithdrawInterestUseCase(ref.read(interestsRepositoryProvider));
});

final interestsProvider = StateNotifierProvider<InterestsNotifier, InterestsState>((ref) {
  return InterestsNotifier(
    ref.read(getReceivedInterestsUseCaseProvider),
    ref.read(getSentInterestsUseCaseProvider),
    ref.read(getProfileViewsUseCaseProvider),
  );
});
