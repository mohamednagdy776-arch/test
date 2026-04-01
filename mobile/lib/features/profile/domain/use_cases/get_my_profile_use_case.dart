import '../entities/profile.dart';
import '../repositories/profile_repository.dart';

class GetMyProfileUseCase {
  final ProfileRepository _repository;

  GetMyProfileUseCase(this._repository);

  Future<Profile> call() => _repository.getMyProfile();
}
