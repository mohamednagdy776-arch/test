import '../../domain/entities/family_relationship.dart';

class FamilyState {
  final List<FamilyRelationship> guardians; // my-guardians: I'm the ward
  final List<FamilyRelationship> wards; // my-wards: I'm the guardian
  final bool isLoading;
  final bool isInviting;
  final String? error;

  const FamilyState({
    this.guardians = const [],
    this.wards = const [],
    this.isLoading = false,
    this.isInviting = false,
    this.error,
  });

  // `error` is always directly assigned (same convention as
  // AffiliatesState/PremiumState) -- callers that mean to preserve the
  // current error must explicitly pass it back in via `error: state.error`.
  FamilyState copyWith({
    List<FamilyRelationship>? guardians,
    List<FamilyRelationship>? wards,
    bool? isLoading,
    bool? isInviting,
    String? error,
  }) {
    return FamilyState(
      guardians: guardians ?? this.guardians,
      wards: wards ?? this.wards,
      isLoading: isLoading ?? this.isLoading,
      isInviting: isInviting ?? this.isInviting,
      error: error,
    );
  }
}
