import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Earthy Paper Canvas & Deep Ink Palette (Authentic UrbanGrow Identity)
  static const Color canvas = Color(0xFFF4EFEA);       // Warm tactile paper canvas
  static const Color surface = Color(0xFFFAF8F5);      // Clean warm bone white card surface
  static const Color surfaceElevated = Colors.white;   // Pure white for crisp contrast elements
  static const Color charcoal = Color(0xFF141518);     // Deep confident printer ink
  static const Color charcoalSoft = Color(0xFF22242A); // Soft matte charcoal for hardware panels
  static const Color charcoalMuted = Color(0xFF32353E);// Outline stroke for dark panels

  // Typography Colors
  static const Color textPrimary = Color(0xFF141518);
  static const Color textSecondary = Color(0xFF5A5D65);
  static const Color textMuted = Color(0xFF8C8F98);
  static const Color textLight = Color(0xFFFAF8F5);

  // Border & Hairline Tokens
  static const Color borderLight = Color(0xFFE5DFD7);
  static const Color borderMedium = Color(0xFFD6CEBF);
  static const Color borderDark = Color(0xFF2E313A);

  // Biological Accent Colors (Natural chlorophyll, water, and nitrogen tones)
  static const Color leafGreen = Color(0xFF059669);    // Level 4 Pakcoy chlorophyll
  static const Color leafGreenLight = Color(0xFF10B981);
  static const Color aquaticCyan = Color(0xFF0284C7);  // Level 3 Nila biofloc water
  static const Color aquaticCyanLight = Color(0xFF0EA5E9);
  static const Color bioAmber = Color(0xFFD97706);     // Level 2 Kangkung hydroton biofilter
  static const Color bioAmberLight = Color(0xFFF59E0B);
  static const Color sumpSlate = Color(0xFF475569);    // Level 1 Lele solids & sump pump
  static const Color alertCoral = Color(0xFFE11D48);   // Urgent anomaly alert

  // Shadows
  static const List<BoxShadow> softShadow = [
    BoxShadow(
      color: Color(0x0A141518),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> floatingPillShadow = [
    BoxShadow(
      color: Color(0x14141518),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
  ];

  // Backward-compatibility aliases
  static const Color cardBg = surface;
  static const Color accentEmerald = leafGreen;
  static const Color accentEmeraldDark = leafGreen;
  static const Color accentYellow = bioAmber;
  static const Color accentYellowDeep = bioAmber;
  static const Color accentCyan = aquaticCyan;
  static const Color accentCoral = alertCoral;
  static const Color accentIndigo = Color(0xFF4F46E5);
  static const Color accentSlate = sumpSlate;
  static const List<BoxShadow> cardShadow = softShadow;

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.interTextTheme();

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: canvas,
      colorScheme: const ColorScheme.light(
        primary: charcoal,
        secondary: leafGreen,
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
