import '../entities/public_profile.dart';
import '../repositories/profile_repository.dart';

class GetPublicProfileUseCase {
  final ProfileRepository _repository;
  const GetPublicProfileUseCase(this._repository);

  Future<PublicProfile> call(String userId) => _repository.getPublicProfile(userId);
}
