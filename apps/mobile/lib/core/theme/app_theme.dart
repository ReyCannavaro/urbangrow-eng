import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color canvas = Color(0xFFF3EFE6);
  static const Color cardBg = Color(0xFFFAF8F3);
  static const Color surface = Colors.white;
  static const Color charcoal = Color(0xFF1E1F24);
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF555555);
  static const Color textMuted = Color(0xFF888888);
  static const Color borderLight = Color(0xFFE5DFD3);
  static const Color borderMedium = Color(0xFFD6CEBF);

  static const Color accentYellow = Color(0xFFFACC15);
  static const Color accentYellowDeep = Color(0xFFD97706);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color accentCoral = Color(0xFFE11D48);
  static const Color accentCyan = Color(0xFF0EA5E9);

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.interTextTheme();

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: canvas,
      colorScheme: const ColorScheme.light(
        primary: charcoal,
        secondary: accentYellow,
        surface: surface,
      ),
      textTheme: baseTextTheme.apply(
        bodyColor: textPrimary,
        displayColor: textPrimary,
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: borderLight),
        ),
      ),
    );
  }
}
