import '../../domain/entities/family_relationship.dart';
import '../../domain/repositories/family_repository.dart';
import '../data_sources/family_remote_data_source.dart';

class FamilyRepositoryImpl implements FamilyRepository {
  final FamilyRemoteDataSource _remoteDataSource;
  const FamilyRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<FamilyRelationship>> getMyGuardians() async {
    final list = await _remoteDataSource.getMyGuardians();
    return list.map((e) => FamilyRelationship.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<FamilyRelationship>> getMyWards() async {
    final list = await _remoteDataSource.getMyWards();
    return list.map((e) => FamilyRelationship.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<FamilyRelationship> inviteGuardian({required String guardianUserId, required String type}) async {
    final json = await _remoteDataSource.inviteGuardian(guardianUserId: guardianUserId, type: type);
    return FamilyRelationship.fromJson(json);
  }

  @override
  Future<FamilyRelationship> acceptInvitation(String relationshipId) async {
    final json = await _remoteDataSource.acceptInvitation(relationshipId);
    return FamilyRelationship.fromJson(json);
  }

  @override
  Future<void> revokeRelationship(String relationshipId) => _remoteDataSource.revokeRelationship(relationshipId);
}
