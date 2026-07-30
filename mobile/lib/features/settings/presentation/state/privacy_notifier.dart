import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/privacy_use_case.dart';
import 'privacy_state.dart';

class PrivacyNotifier extends StateNotifier<PrivacyState> {
  final PrivacyUseCase _useCase;
  PrivacyNotifier(this._useCase) : super(const PrivacyState());

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final settings = await _useCase.getSettings();
      final blocks = await _useCase.getBlocks();
      final photoRequests = await _useCase.getPhotoAccessRequests();
      state = state.copyWith(
        settings: settings,
        blocks: blocks,
        photoRequests: photoRequests,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل إعدادات الخصوصية');
    }
  }

  Future<bool> updateField(String key, dynamic value) async {
    try {
      final updated = await _useCase.updateSettings({key: value});
      state = state.copyWith(settings: updated, error: state.error);
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر حفظ الإعداد');
      return false;
    }
  }

  Future<bool> unblockUser(String blockedUserId) async {
    try {
      await _useCase.unblockUser(blockedUserId);
      state = state.copyWith(
        blocks: state.blocks.where((b) => b.blockedUserId != blockedUserId).toList(),
        error: state.error,
      );
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر إلغاء الحظر');
      return false;
    }
  }

  Future<bool> respondToPhotoRequest(String requestId, bool approve) async {
    try {
      await _useCase.respondToPhotoAccessRequest(requestId, approve);
      state = state.copyWith(
        photoRequests: state.photoRequests.where((r) => r.id != requestId).toList(),
        error: state.error,
      );
      return true;
    } catch (_) {
      state = state.copyWith(error: 'تعذّر تنفيذ الإجراء');
      return false;
    }
  }
}
