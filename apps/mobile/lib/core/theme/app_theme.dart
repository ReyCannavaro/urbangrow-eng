import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // =========================================================================
  // Pine Executive & Clean Botanical Palette (100% Aligned with DESIGN.md)
  // =========================================================================

  // Surfaces & Neutrals
  static const Color canvas = Color(0xFFF8F9FA);           // Clean console canvas
  static const Color frame = Color(0xFFF0F2F5);            // Outer viewport frame
  static const Color surface = Color(0xFFFFFFFF);          // Pure card surface
  static const Color surfaceSubtle = Color(0xFFF1F5F9);    // Subtle card tint
  static const Color surfaceMuted = Color(0xFFF9FAFB);

  // The Pine Botanical System (Core Accents)
  static const Color pinePrimary = Color(0xFF165B39);      // Deep Forest Pine (Primary anchor)
  static const Color pineDark = Color(0xFF0F3F27);         // Pine Dark elevated
  static const Color pineWavy = Color(0xFF0B2C1B);         // Deep Pine Dark for Wavy Hardware Panel
  static const Color sageMint = Color(0xFF4EAB7C);         // Sage Mint (Highlight & Active)
  static const Color mintWash = Color(0xFFDCFCE7);         // Mint Wash Tint for "Optimal" badge
  static const Color mintText = Color(0xFF166534);         // Mint Text Accent

  // Typography Ink Colors
  static const Color textPrimary = Color(0xFF111827);      // Primary ink / KPI bold numbers
  static const Color textSecondary = Color(0xFF4B5563);    // Secondary subtitle / parameter name
  static const Color textMuted = Color(0xFF9CA3AF);        // Muted timestamp / unit
  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textInverse = Color(0xFFFFFFFF);

  // Border & Hairline Tokens
  static const Color borderLight = Color(0xFFE5E7EB);      // Hairline 1px border (#E5E7EB)
  static const Color borderMedium = Color(0xFFD1D5DB);     // Neutral medium border
  static const Color borderDark = Color(0x26FFFFFF);       // Semi-transparent border on dark panels
  static const Color borderCharcoal = Color(0x26FFFFFF);

  // Semantic Biological & Telemetry Status
  static const Color statusOptimal = Color(0xFF166534);    // Green optimal (Bg: #DCFCE7)
  static const Color statusWarning = Color(0xFFB45309);    // Amber buffer (Bg: #FEF3C7)
  static const Color statusAlert = Color(0xFFE11D48);      // Red alert / stop (Bg: #FFE4E6)
  static const Color accentCyan = Color(0xFF0284C7);       // Bio Cyan (Nila DO / aquatic)
  static const Color accentAmber = Color(0xFFD97706);      // Hydroton Amber (Kangkung / TDS)

  // Backward-compatibility aliases for existing references
  static const Color charcoal = pineDark;
  static const Color charcoalElevated = pineWavy;
  static const Color charcoalSoft = pineDark;
  static const Color charcoalMuted = Color(0xFF1E3A2B);
  static const Color accentYellow = sageMint;
  static const Color accentYellowLight = mintWash;
  static const Color accentYellowDeep = pinePrimary;
  static const Color leafGreen = pinePrimary;
  static const Color leafGreenLight = sageMint;
  static const Color aquaticCyan = accentCyan;
  static const Color aquaticCyanLight = Color(0xFF38BDF8);
  static const Color bioAmber = accentAmber;
  static const Color bioAmberLight = Color(0xFFF59E0B);
  static const Color sumpSlate = Color(0xFF475569);
  static const Color alertCoral = statusAlert;
  static const Color cardBg = surface;
  static const Color accentEmerald = pinePrimary;
  static const Color accentEmeraldDark = pineDark;
  static const Color accentCoral = statusAlert;
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color accentSlate = sumpSlate;

  // Modern Subtle Shadows
  static const List<BoxShadow> softShadow = [
    BoxShadow(
      color: Color(0x08111827),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x06111827),
      blurRadius: 10,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> floatingPillShadow = [
    BoxShadow(
      color: Color(0x12111827),
      blurRadius: 20,
      offset: Offset(0, 6),
    ),
  ];

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.plusJakartaSansTextTheme();

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: canvas,
      colorScheme: const ColorScheme.light(
        primary: pinePrimary,
        secondary: sageMint,
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
