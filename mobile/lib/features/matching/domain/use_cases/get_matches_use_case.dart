import '../../../../core/api/api_response.dart';
import '../entities/match.dart';
import '../repositories/matching_repository.dart';

class GetMatchesUseCase {
  final MatchingRepository _repository;
  const GetMatchesUseCase(this._repository);

  Future<PaginatedResult<Match>> call({
    String? status,
    int page = 1,
    int limit = 20,
    int? minAge,
    int? maxAge,
    String? location,
    String? religiousCommitment,
  }) {
    return _repository.getMatches(
      status: status,
      page: page,
      limit: limit,
      minAge: minAge,
      maxAge: maxAge,
      location: location,
      religiousCommitment: religiousCommitment,
    );
  }
}
