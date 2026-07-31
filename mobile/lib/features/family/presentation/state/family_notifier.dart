import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/family_use_case.dart';
import 'family_state.dart';

class FamilyRelationshipsNotifier extends StateNotifier<FamilyState> {
  final FamilyUseCase _useCase;
  FamilyRelationshipsNotifier(this._useCase) : super(const FamilyState());

  Future<void> loadInitial() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Both lists matter regardless of whether either is empty (no `data:
      // null` special case on this controller, unlike affiliates) -- always
      // fetch both, mirroring web's two independent useQuery calls.
      final results = await Future.wait([_useCase.getMyGuardians(), _useCase.getMyWards()]);
      state = state.copyWith(
        guardians: results[0],
        wards: results[1],
        isLoading: false,
        error: null,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل بيانات الأسرة');
    }
  }

  Future<bool> invite({required String guardianUserId, required String type}) async {
    state = state.copyWith(isInviting: true, error: null);
    try {
      await _useCase.inviteGuardian(guardianUserId: guardianUserId, type: type);
      state = state.copyWith(isInviting: false, error: null);
      await loadInitial();
      return true;
    } catch (e) {
      state = state.copyWith(isInviting: false, error: _errorMessage(e));
      return false;
    }
  }

  Future<bool> accept(String relationshipId) async {
    try {
      await _useCase.acceptInvitation(relationshipId);
      await loadInitial();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر قبول الدعوة');
      return false;
    }
  }

  // Also used as "reject" for a received pending invitation and "cancel" for
  // a sent one -- the backend already lets either party (ward or guardian)
  // revoke, same route for both actions (#304).
  Future<bool> revoke(String relationshipId) async {
    try {
      await _useCase.revokeRelationship(relationshipId);
      await loadInitial();
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر إتمام الإجراء');
      return false;
    }
  }

  String _errorMessage(Object e) {
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map && data['message'] is String) return data['message'] as String;
    }
    return 'حدث خطأ، حاول مجدداً';
  }
}
