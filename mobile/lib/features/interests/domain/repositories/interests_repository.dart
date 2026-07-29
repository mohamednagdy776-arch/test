import '../../../../core/api/api_response.dart';
import '../entities/interest_row.dart';
import '../entities/profile_view_row.dart';

abstract class InterestsRepository {
  Future<List<InterestRow>> getReceived();
  Future<List<InterestRow>> getSent();
  Future<PaginatedResult<ProfileViewRow>> getProfileViews({int page = 1, int limit = 20});

  /// "Send Salam" -- returns { status, mutual }.
  Future<Map<String, dynamic>> sendInterest(String userId);
  Future<void> withdrawInterest(String userId);
}
