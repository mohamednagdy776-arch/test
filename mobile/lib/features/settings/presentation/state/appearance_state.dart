import '../../domain/entities/appearance_settings.dart';

class AppearanceState {
  final AppearanceSettings settings;
  final bool isLoading;
  final bool isSaving;
  final String? error;

  const AppearanceState({
    this.settings = const AppearanceSettings(),
    this.isLoading = false,
    this.isSaving = false,
    this.error,
  });

  AppearanceState copyWith({
    AppearanceSettings? settings,
    bool? isLoading,
    bool? isSaving,
    String? error,
  }) {
    return AppearanceState(
      settings: settings ?? this.settings,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: error,
    );
  }
}
