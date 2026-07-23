import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/matching_remote_data_source.dart';
import '../../data/repositories/matching_repository_impl.dart';
import '../../domain/repositories/matching_repository.dart';
import '../../domain/use_cases/get_matches_use_case.dart';
import '../../domain/use_cases/generate_matches_use_case.dart';
import '../../domain/use_cases/get_match_profile_use_case.dart';
import '../../domain/use_cases/respond_to_match_use_case.dart';
import '../state/matches_notifier.dart';
import '../state/matches_state.dart';
import '../../../../core/api/dio_client.dart';

final matchingRemoteDataSourceProvider = Provider((ref) {
  return MatchingRemoteDataSource(DioClient.create());
});

final matchingRepositoryProvider = Provider<MatchingRepository>((ref) {
  return MatchingRepositoryImpl(ref.read(matchingRemoteDataSourceProvider));
});

final getMatchesUseCaseProvider = Provider((ref) {
  return GetMatchesUseCase(ref.read(matchingRepositoryProvider));
});

final generateMatchesUseCaseProvider = Provider((ref) {
  return GenerateMatchesUseCase(ref.read(matchingRepositoryProvider));
});

final getMatchProfileUseCaseProvider = Provider((ref) {
  return GetMatchProfileUseCase(ref.read(matchingRepositoryProvider));
});

final respondToMatchUseCaseProvider = Provider((ref) {
  return RespondToMatchUseCase(ref.read(matchingRepositoryProvider));
});

final matchesProvider = StateNotifierProvider<MatchesNotifier, MatchesState>((ref) {
  return MatchesNotifier(
    ref.read(getMatchesUseCaseProvider),
    ref.read(generateMatchesUseCaseProvider),
    ref.read(respondToMatchUseCaseProvider),
  );
});
