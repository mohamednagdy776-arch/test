import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/profile_remote_data_source.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/use_cases/get_my_profile_use_case.dart';
import '../../domain/use_cases/update_profile_use_case.dart';
import '../../domain/use_cases/upload_avatar_use_case.dart';
import '../../domain/use_cases/get_public_profile_use_case.dart';
import '../../domain/use_cases/get_profile_content_use_case.dart';
import '../../domain/use_cases/get_follow_summary_use_case.dart';
import '../../domain/use_cases/report_user_use_case.dart';
import '../state/public_profile_notifier.dart';
import '../state/public_profile_state.dart';
import '../../../friends/presentation/providers/friends_providers.dart';
import '../../../interests/presentation/providers/interests_providers.dart';
import '../../../../core/api/dio_client.dart';

final profileRemoteDataSourceProvider = Provider((ref) {
  return ProfileRemoteDataSource(DioClient.create());
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(ref.read(profileRemoteDataSourceProvider));
});

final getMyProfileUseCaseProvider = Provider((ref) {
  return GetMyProfileUseCase(ref.read(profileRepositoryProvider));
});

final updateProfileUseCaseProvider = Provider((ref) {
  return UpdateProfileUseCase(ref.read(profileRepositoryProvider));
});

final uploadAvatarUseCaseProvider = Provider((ref) {
  return UploadAvatarUseCase(ref.read(profileRepositoryProvider));
});

final myProfileProvider = FutureProvider<Profile>((ref) async {
  return ref.read(getMyProfileUseCaseProvider).call();
});

final getPublicProfileUseCaseProvider = Provider((ref) {
  return GetPublicProfileUseCase(ref.read(profileRepositoryProvider));
});

final getProfileContentUseCaseProvider = Provider((ref) {
  return GetProfileContentUseCase(ref.read(profileRepositoryProvider));
});

final getFollowSummaryUseCaseProvider = Provider((ref) {
  return GetFollowSummaryUseCase(ref.read(profileRepositoryProvider));
});

final reportUserUseCaseProvider = Provider((ref) {
  return ReportUserUseCase(ref.read(profileRepositoryProvider));
});

// Keyed by the viewed userId -- a fresh notifier per profile screen instance,
// same .family pattern as chatThreadProvider/groupDetailProvider.
final publicProfileProvider =
    StateNotifierProvider.family<PublicProfileNotifier, PublicProfileState, String>((ref, userId) {
  return PublicProfileNotifier(
    userId,
    ref.read(getPublicProfileUseCaseProvider),
    ref.read(getProfileContentUseCaseProvider),
    ref.read(getFollowSummaryUseCaseProvider),
    ref.read(reportUserUseCaseProvider),
    ref.read(friendRelationsUseCaseProvider),
    ref.read(respondToFriendRequestUseCaseProvider),
    ref.read(sendInterestUseCaseProvider),
    ref.read(getSentInterestsUseCaseProvider),
  );
});
