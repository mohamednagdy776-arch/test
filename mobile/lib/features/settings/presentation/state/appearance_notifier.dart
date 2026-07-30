import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/appearance_use_case.dart';
import 'appearance_state.dart';

class AppearanceNotifier extends StateNotifier<AppearanceState> {
  final AppearanceUseCase _useCase;
  AppearanceNotifier(this._useCase) : super(const AppearanceState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final settings = await _useCase.getSettings();
      state = state.copyWith(settings: settings, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل إعدادات المظهر');
    }
  }

  void setReducedMotion(bool value) {
    state = state.copyWith(settings: state.settings.copyWith(reducedMotion: value), error: state.error);
  }

  void setHighContrast(bool value) {
    state = state.copyWith(settings: state.settings.copyWith(highContrast: value), error: state.error);
  }

  void setLargeText(bool value) {
    state = state.copyWith(settings: state.settings.copyWith(largeText: value), error: state.error);
  }

  Future<bool> save() async {
    state = state.copyWith(isSaving: true, error: null);
    try {
      final updated = await _useCase.updateSettings({
        'reducedMotion': state.settings.reducedMotion,
        'highContrast': state.settings.highContrast,
        'largeText': state.settings.largeText,
      });
      state = state.copyWith(settings: updated, isSaving: false);
      return true;
    } catch (_) {
      state = state.copyWith(isSaving: false, error: 'تعذّر حفظ إعدادات المظهر');
      return false;
    }
  }
}
