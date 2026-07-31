import '../entities/family_relationship.dart';

abstract class FamilyRepository {
  // Relationships the current user (as ward) has sent invitations for --
  // web's `my-guardians` query.
  Future<List<FamilyRelationship>> getMyGuardians();

  // Relationships the current user (as guardian) has been invited into --
  // web's `my-wards` query. Before #200 there was no way for the invited
  // party to even discover invitations addressed to them; this is the
  // endpoint that fixed that.
  Future<List<FamilyRelationship>> getMyWards();

  Future<FamilyRelationship> inviteGuardian({required String guardianUserId, required String type});

  Future<FamilyRelationship> acceptInvitation(String relationshipId);

  // Void response (200, empty body) -- used both to cancel a sent invitation
  // and to reject/cancel a received one; the backend allows either party
  // (ward or guardian) to revoke a pending or active relationship (#304).
  Future<void> revokeRelationship(String relationshipId);
}
