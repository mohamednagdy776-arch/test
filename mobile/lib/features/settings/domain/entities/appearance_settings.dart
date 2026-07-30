// Mirrors backend/src/settings/dto/update-appearance.dto.ts. Mobile has no
// theme-switching infra (AppTheme is a single hardcoded "Emerald Sanctum"
// theme, see core/constants/theme.dart) so `theme`/`colorScheme`/`fontFamily`
// are round-tripped as-is (never edited from mobile) and only the
// accessibility flags are actually editable here.
class AppearanceSettings {
  final String theme;
  final String colorScheme;
  final bool reducedMotion;
  final bool highContrast;
  final bool largeText;
  final String fontFamily;

  const AppearanceSettings({
    this.theme = 'system',
    this.colorScheme = 'emerald',
    this.reducedMotion = false,
    this.highContrast = false,
    this.largeText = false,
    this.fontFamily = 'default',
  });

  factory AppearanceSettings.fromJson(Map<String, dynamic> json) {
    return AppearanceSettings(
      theme: json['theme'] as String? ?? 'system',
      colorScheme: json['colorScheme'] as String? ?? 'emerald',
      reducedMotion: json['reducedMotion'] as bool? ?? false,
      highContrast: json['highContrast'] as bool? ?? false,
      largeText: json['largeText'] as bool? ?? false,
      fontFamily: json['fontFamily'] as String? ?? 'default',
    );
  }

  AppearanceSettings copyWith({
    bool? reducedMotion,
    bool? highContrast,
    bool? largeText,
  }) {
    return AppearanceSettings(
      theme: theme,
      colorScheme: colorScheme,
      reducedMotion: reducedMotion ?? this.reducedMotion,
      highContrast: highContrast ?? this.highContrast,
      largeText: largeText ?? this.largeText,
      fontFamily: fontFamily,
    );
  }
}
