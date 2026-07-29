import '../../../../core/api/api_response.dart';
import '../../domain/entities/interest_row.dart';
import '../../domain/entities/profile_view_row.dart';
import '../../domain/repositories/interests_repository.dart';
import '../data_sources/interests_remote_data_source.dart';

class InterestsRepositoryImpl implements InterestsRepository {
  final InterestsRemoteDataSource _remote;
  const InterestsRepositoryImpl(this._remote);

  @override
  Future<List<InterestRow>> getReceived() async {
    final items = await _remote.getReceived();
    return items.map(InterestRow.fromJson).toList();
  }

  @override
  Future<List<InterestRow>> getSent() async {
    final items = await _remote.getSent();
    return items.map(InterestRow.fromJson).toList();
  }

  @override
  Future<PaginatedResult<ProfileViewRow>> getProfileViews({int page = 1, int limit = 20}) async {
    final result = await _remote.getProfileViews(page: page, limit: limit);
    return PaginatedResult<ProfileViewRow>(
      items: result.items.map(ProfileViewRow.fromJson).toList(),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    );
  }

  @override
  Future<Map<String, dynamic>> sendInterest(String userId) => _remote.sendInterest(userId);

  @override
  Future<void> withdrawInterest(String userId) => _remote.withdrawInterest(userId);
}
