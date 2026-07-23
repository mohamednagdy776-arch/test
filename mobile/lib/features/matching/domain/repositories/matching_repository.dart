import '../../../../core/api/api_response.dart';
import '../entities/match.dart';
import '../entities/match_profile.dart';

abstract class MatchingRepository {
  Future<PaginatedResult<Match>> getMatches({String? status, int page = 1, int limit = 20});
  Future<void> generateMatches();
  Future<MatchProfile> getMatchProfile(String userId);
  Future<void> acceptMatch(String id);
  Future<void> rejectMatch(String id);
  Future<void> undoAccept(String id);
  Future<void> undoReject(String id);
}
