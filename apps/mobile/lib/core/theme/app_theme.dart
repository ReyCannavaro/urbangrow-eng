import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Warm Editorial Bento Palette (100% Aligned with DESIGN.md)
  static const Color canvas = Color(0xFFF3EFE6);           // Warm tactile linen canvas
  static const Color frame = Color(0xFFFAF8F3);            // Clean warm console frame
  static const Color surface = Color(0xFFFFFFFF);          // Pure snow card surface
  static const Color surfaceSubtle = Color(0xFFF7F4EE);    // Subtle card tint
  static const Color charcoal = Color(0xFF1E1F24);         // Deep printer ink charcoal
  static const Color charcoalElevated = Color(0xFF282A30); // Elevated dark panels
  static const Color charcoalSoft = Color(0xFF282A30);
  static const Color charcoalMuted = Color(0xFF383B44);

  // Typography Colors
  static const Color textPrimary = Color(0xFF191B1F);
  static const Color textSecondary = Color(0xFF666973);
  static const Color textMuted = Color(0xFF9598A3);
  static const Color textLight = Color(0xFFF8FAFC);
  static const Color textInverse = Color(0xFFF8FAFC);

  // Border & Hairline Tokens
  static const Color borderLight = Color(0x0F000000);      // rgba(0, 0, 0, 0.06)
  static const Color borderMedium = Color(0x1F000000);     // rgba(0, 0, 0, 0.12)
  static const Color borderDark = Color(0x1AFFFFFF);       // rgba(255, 255, 255, 0.10)
  static const Color borderCharcoal = Color(0x1AFFFFFF);

  // Signature & Biological Accents
  static const Color accentYellow = Color(0xFFFACC15);          // Signature Sunlit Butter Yellow
  static const Color accentYellowLight = Color(0xFFFEF08A);     // Light yellow chip
  static const Color accentYellowDeep = Color(0xFFEAB308);      // Deep gold yellow
  static const Color leafGreen = Color(0xFF10B981);             // Level 4 Pakcoy chlorophyll
  static const Color leafGreenLight = Color(0xFF34D399);
  static const Color aquaticCyan = Color(0xFF0EA5E9);           // Level 3 Nila biofloc water
  static const Color aquaticCyanLight = Color(0xFF38BDF8);
  static const Color bioAmber = Color(0xFFD97706);              // Level 2 Kangkung hydroton biofilter
  static const Color bioAmberLight = Color(0xFFF59E0B);
  static const Color sumpSlate = Color(0xFF475569);             // Level 1 Lele solids & sump pump
  static const Color alertCoral = Color(0xFFF97316);            // Action trigger & alert

  // Backward-compatibility aliases
  static const Color cardBg = surface;
  static const Color accentEmerald = leafGreen;
  static const Color accentEmeraldDark = leafGreen;
  static const Color accentCyan = aquaticCyan;
  static const Color accentCoral = alertCoral;
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color accentSlate = sumpSlate;

  // Shadows
  static const List<BoxShadow> softShadow = [
    BoxShadow(
      color: Color(0x0A191B1F),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x08191B1F),
      blurRadius: 12,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> floatingPillShadow = [
    BoxShadow(
      color: Color(0x14191B1F),
      blurRadius: 24,
      offset: Offset(0, 8),
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
          borderRadius: BorderRadius.circular(28),
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
