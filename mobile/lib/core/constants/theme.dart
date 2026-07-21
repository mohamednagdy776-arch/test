import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Mirrors the web app's actual live default theme -- "luxury"/Emerald
// Sanctum, hardcoded in web/src/components/ui/ThemeProvider.tsx regardless
// of the 18-theme switcher. Values from web/src/app/globals.css's
// [data-theme="luxury"] block. Body font is Noto Sans Arabic (confirmed from
// globals.css's `body { font-family }` rule -- Noto Serif Arabic is only used
// decoratively on the marketing landing page, not the app itself).
class AppTheme {
  static const Color primaryColor = Color(0xFF0A3D2B); // deep Islamic forest
  static const Color accentColor = Color(0xFFB8892A); // antique gold
  static const Color secondaryColor = Color(0xFF1A6B4A); // emerald
  static const Color backgroundColor = Color(0xFFF4EFE4); // warm parchment
  static const Color foregroundColor = Color(0xFF0E1912);
  static const Color surfaceColor = Color(0xFFFDFAF3); // card
  static const Color dangerColor = Color(0xFFE02424);
  static const Color successColor = Color(0xFF057A55);
  static const Color warningColor = Color(0xFFF6C23E);
  static const Color textSecondary = Color(0xFF6B7280);

  static ThemeData get lightTheme {
    final textTheme = GoogleFonts.notoSansArabicTextTheme().apply(
      bodyColor: foregroundColor,
      displayColor: foregroundColor,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        error: dangerColor,
        surface: surfaceColor,
      ),
      textTheme: textTheme,
      scaffoldBackgroundColor: backgroundColor,
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceColor,
        foregroundColor: foregroundColor,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.notoSansArabic(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: foregroundColor,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.notoSansArabic(fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD9CFB8)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD9CFB8)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFE7DFC9)),
        ),
      ),
    );
  }
}
