import '../entities/family_relationship.dart';
import '../repositories/family_repository.dart';

class FamilyUseCase {
  final FamilyRepository _repository;
  const FamilyUseCase(this._repository);

  Future<List<FamilyRelationship>> getMyGuardians() => _repository.getMyGuardians();

  Future<List<FamilyRelationship>> getMyWards() => _repository.getMyWards();

  Future<FamilyRelationship> inviteGuardian({required String guardianUserId, required String type}) =>
      _repository.inviteGuardian(guardianUserId: guardianUserId, type: type);

  Future<FamilyRelationship> acceptInvitation(String relationshipId) =>
      _repository.acceptInvitation(relationshipId);

  Future<void> revokeRelationship(String relationshipId) => _repository.revokeRelationship(relationshipId);
}
