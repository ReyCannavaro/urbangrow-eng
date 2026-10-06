import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Warm Editorial Bento Palette (Matching UrbanGrow Web Exactly)
  static const Color canvas = Color(0xFFF3EFE6);
  static const Color cardBg = Color(0xFFFAF8F3);
  static const Color surface = Colors.white;
  static const Color charcoal = Color(0xFF1E1F24);
  static const Color charcoalSoft = Color(0xFF282A30);
  static const Color charcoalMuted = Color(0xFF383A42);

  // Text Colors
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF555555);
  static const Color textMuted = Color(0xFF888888);
  static const Color textLight = Color(0xFFFAF8F3);

  // Border Tokens
  static const Color borderLight = Color(0xFFE5DFD3);
  static const Color borderMedium = Color(0xFFD6CEBF);
  static const Color borderDark = Color(0xFF33353C);

  // Accent Colors
  static const Color accentYellow = Color(0xFFFACC15);
  static const Color accentYellowDeep = Color(0xFFD97706);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color accentEmeraldDark = Color(0xFF047857);
  static const Color accentCoral = Color(0xFFE11D48);
  static const Color accentCyan = Color(0xFF0EA5E9);
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color accentSlate = Color(0xFF64748B);

  // Shadows
  static const List<BoxShadow> softShadow = [
    BoxShadow(
      color: Color(0x0A1E1F24),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x061E1F24),
      blurRadius: 10,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> floatingPillShadow = [
    BoxShadow(
      color: Color(0x121E1F24),
      blurRadius: 20,
      offset: Offset(0, 6),
    ),
  ];

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
      dividerTheme: const DividerThemeData(
        color: borderLight,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
