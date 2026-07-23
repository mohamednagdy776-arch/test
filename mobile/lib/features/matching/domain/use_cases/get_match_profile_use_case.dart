import '../entities/match_profile.dart';
import '../repositories/matching_repository.dart';

class GetMatchProfileUseCase {
  final MatchingRepository _repository;
  const GetMatchProfileUseCase(this._repository);

  Future<MatchProfile> call(String userId) => _repository.getMatchProfile(userId);
}
