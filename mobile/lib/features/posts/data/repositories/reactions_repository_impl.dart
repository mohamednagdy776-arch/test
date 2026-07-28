import '../../domain/entities/reaction_summary.dart';
import '../../domain/repositories/reactions_repository.dart';
import '../data_sources/reactions_remote_data_source.dart';

class ReactionsRepositoryImpl implements ReactionsRepository {
  final ReactionsRemoteDataSource _remoteDataSource;
  const ReactionsRepositoryImpl(this._remoteDataSource);

  @override
  Future<String?> reactToPost(String postId, String type) => _remoteDataSource.reactToPost(postId, type);

  @override
  Future<ReactionSummary> getReactions(String postId) async {
    final data = await _remoteDataSource.getReactions(postId);
    return ReactionSummary.fromJson(data);
  }

  @override
  Future<String?> getMyReaction(String postId) async {
    final data = await _remoteDataSource.getMyReaction(postId);
    return data?['type'] as String?;
  }

  @override
  Future<Map<String, int>> getBreakdown(String postId) => _remoteDataSource.getBreakdown(postId);
}
