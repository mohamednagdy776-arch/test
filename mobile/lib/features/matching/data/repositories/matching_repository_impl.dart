import '../../../../core/api/api_response.dart';
import '../../domain/entities/match.dart';
import '../../domain/entities/match_profile.dart';
import '../../domain/repositories/matching_repository.dart';
import '../data_sources/matching_remote_data_source.dart';

class MatchingRepositoryImpl implements MatchingRepository {
  final MatchingRemoteDataSource _remoteDataSource;
  const MatchingRepositoryImpl(this._remoteDataSource);

  @override
  Future<PaginatedResult<Match>> getMatches({String? status, int page = 1, int limit = 20}) async {
    final page0 = await _remoteDataSource.getMatches(status: status, page: page, limit: limit);
    return PaginatedResult(
      items: page0.items.map(Match.fromJson).toList(),
      total: page0.total,
      page: page0.page,
      limit: page0.limit,
      totalPages: page0.totalPages,
    );
  }

  @override
  Future<void> generateMatches() => _remoteDataSource.generateMatches();

  @override
  Future<MatchProfile> getMatchProfile(String userId) async {
    final data = await _remoteDataSource.getMatchProfile(userId);
    return MatchProfile.fromJson(data);
  }

  @override
  Future<void> acceptMatch(String id) => _remoteDataSource.acceptMatch(id);

  @override
  Future<void> rejectMatch(String id) => _remoteDataSource.rejectMatch(id);

  @override
  Future<void> undoAccept(String id) => _remoteDataSource.undoAccept(id);

  @override
  Future<void> undoReject(String id) => _remoteDataSource.undoReject(id);
}
