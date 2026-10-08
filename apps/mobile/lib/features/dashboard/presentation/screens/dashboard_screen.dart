import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';

class DashboardScreen extends ConsumerWidget {
  final VoidCallback? onOpenTowerTab;
  final VoidCallback? onOpenControlsTab;

  const DashboardScreen({
    super.key,
    this.onOpenTowerTab,
    this.onOpenControlsTab,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

    final activeActuators = telemetry.actuators.values.where((a) => a.isOn).length;
    final totalActuators = telemetry.actuators.length;

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: RefreshIndicator(
        onRefresh: () async => notifier.fetchLatest(),
        color: AppTheme.charcoal,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Hero Greeting & Multi-Segment Growth Stage Progress Bar
              _buildHeroWelcomeSection(),

              const SizedBox(height: 18),

              // 2. Bento Card 1: Photographic Ecosystem Hero Card
              _buildPhotographicHeroCard(context),

              const SizedBox(height: 14),

              // 3. Bento Card 2: Lollipop Parameter Chart (pH & TDS)
              _buildLollipopChartCard(telemetry.sensors.ph, telemetry.sensors.tds),

              const SizedBox(height: 14),

              // 4. Bento Card 3: 270° Sunlit Butter Yellow Arc Dial Gauge (Suhu & DO)
              _buildDialGaugeCard(
                telemetry.sensors.waterTemperature,
                telemetry.sensors.dissolvedOxygen,
              ),

              const SizedBox(height: 14),

              // 5. Bento Card 4: Matte Charcoal Task & Automation Panel
              _buildDarkTaskPanel(
                telemetry,
                notifier,
                activeActuators,
                totalActuators,
              ),

              const SizedBox(height: 14),

              // 6. Quick Feed Dispenser Pill
              _buildQuickFeedPill(telemetry, notifier),

              const SizedBox(height: 90),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // SECTION 1: HERO WELCOME & MULTI-SEGMENT PROGRESS BAR
  // =========================================================================
  Widget _buildHeroWelcomeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Greeting Headline
        RichText(
          text: const TextSpan(
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w300,
              letterSpacing: -0.6,
              color: AppTheme.textPrimary,
              fontFamily: 'Inter',
            ),
            children: [
              TextSpan(text: 'Welcome in, '),
              TextSpan(
                text: 'Urban Farm 01',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Sistem Akuaponik Kaskade 4-Level • ECAD v2.0 Active',
          style: TextStyle(
            fontSize: 12,
            color: AppTheme.textSecondary,
          ),
        ),

        const SizedBox(height: 14),

        // Multi-Segment Stage Progress Bar (Matching Crextio reference in DESIGN.md)
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderLight),
            boxShadow: AppTheme.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stage Labels
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Pembibitan', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                  Text('Vegetatif', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                  Text('Pembesaran', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                  Text('Panen', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                ],
              ),
              const SizedBox(height: 8),

              // Segmented Bar Row
              Row(
                children: [
                  // Stage 1: Charcoal Pill
                  Container(
                    height: 26,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.charcoal,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      '15%',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),

                  // Stage 2: Sunlit Butter Yellow Pill (Active)
                  Expanded(
                    flex: 25,
                    child: Container(
                      height: 26,
                      decoration: BoxDecoration(
                        color: AppTheme.accentYellow,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        '25%',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                          color: AppTheme.charcoal,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),

                  // Stage 3: Hatched Diagonal Bar
                  Expanded(
                    flex: 45,
                    child: Container(
                      height: 26,
                      decoration: BoxDecoration(
                        color: AppTheme.canvas,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AppTheme.borderMedium, style: BorderStyle.solid),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        '50%',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),

                  // Stage 4: Light Outlined Pill
                  Container(
                    height: 26,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: AppTheme.borderMedium),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      '10%',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 3 Big Editorial Stat Counters (27 Nila • 27 Lele • 220 Tanaman)
        Row(
          children: [
            _buildEditorialCounter('27', 'Ikan Nila (L3)', Icons.set_meal_rounded, AppTheme.aquaticCyan),
            const SizedBox(width: 8),
            _buildEditorialCounter('27', 'Ikan Lele (L1)', Icons.water_rounded, AppTheme.sumpSlate),
            const SizedBox(width: 8),
            _buildEditorialCounter('220', 'Tanaman Aktif', Icons.eco_rounded, AppTheme.leafGreen),
          ],
        ),
      ],
    );
  }

  Widget _buildEditorialCounter(String count, String label, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.borderLight),
          boxShadow: AppTheme.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, size: 14, color: color),
                Container(
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: color),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              count,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w300,
                letterSpacing: -0.8,
                fontFamily: 'monospace',
                color: AppTheme.textPrimary,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w500,
                color: AppTheme.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // SECTION 2: BENTO CARD 1 - PHOTOGRAPHIC ECOSYSTEM HERO CARD
  // =========================================================================
  Widget _buildPhotographicHeroCard(BuildContext context) {
    return InkWell(
      onTap: onOpenTowerTab,
      borderRadius: BorderRadius.circular(28),
      child: Container(
        height: 220,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppTheme.borderLight),
          boxShadow: AppTheme.cardShadow,
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Architectural Photo
            Image.asset(
              'assets/images/aquaponic_hero.jpg',
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                color: AppTheme.charcoal,
                alignment: Alignment.center,
                child: const Icon(Icons.forest_rounded, size: 48, color: AppTheme.accentYellow),
              ),
            ),

            // Bottom Gradient Overlay for High Contrast Text
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Color(0x55000000),
                    Color(0xCC000000),
                  ],
                  stops: [0.3, 0.65, 1.0],
                ),
              ),
            ),

            // Top Badges
            Positioned(
              top: 14,
              left: 14,
              right: 14,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(999),
                      boxShadow: AppTheme.softShadow,
                    ),
                    child: const Text(
                      'Closed-Loop Resirkulasi',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.charcoal,
                      ),
                    ),
                  ),
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.92),
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.softShadow,
                    ),
                    child: const Icon(Icons.arrow_outward_rounded, size: 16, color: AppTheme.charcoal),
                  ),
                ],
              ),
            ),

            // Bottom Content
            Positioned(
              left: 16,
              right: 16,
              bottom: 14,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Ekosistem 4-Tingkat',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.4,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Pakcoy • Nila • Kangkung • Lele',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w400,
                          color: Color(0xCCFFFFFF),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.22),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
                    ),
                    child: const Text(
                      '96.2% Skor ECAD',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // SECTION 3: BENTO CARD 2 - LOLLIPOP PARAMETER CHART (pH & TDS)
  // =========================================================================
  Widget _buildLollipopChartCard(double ph, int tds) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Arrow
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Stabilitas pH & TDS',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderMedium),
                ),
                child: const Icon(Icons.arrow_outward_rounded, size: 14, color: AppTheme.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Big Metric Readout
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                ph.toStringAsFixed(2),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w300,
                  letterSpacing: -1.0,
                  fontFamily: 'monospace',
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(width: 4),
              const Text(
                'pH',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 1,
                height: 14,
                color: AppTheme.borderMedium,
              ),
              const SizedBox(width: 12),
              Text(
                'TDS $tds ppm',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'monospace',
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
          const Text(
            'Rentang optimal biologis 6.5 - 7.5',
            style: TextStyle(fontSize: 10.5, color: AppTheme.textMuted),
          ),

          const SizedBox(height: 14),

          // 7-Day Lollipop Capsules Row (S M T W T F S)
          SizedBox(
            height: 105,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _buildLollipopColumn('S', 0.45, false, ''),
                _buildLollipopColumn('M', 0.65, false, ''),
                _buildLollipopColumn('T', 0.55, false, ''),
                _buildLollipopColumn('W', 0.50, false, ''),
                _buildLollipopColumn('T', 0.70, false, ''),
                _buildLollipopColumn('F', 0.88, true, '${ph.toStringAsFixed(2)} pH'),
                _buildLollipopColumn('S', 0.40, false, ''),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLollipopColumn(String day, double heightRatio, bool isHighlight, String badgeText) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        // Floating tooltip badge if highlight
        if (isHighlight) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppTheme.accentYellow,
              borderRadius: BorderRadius.circular(999),
              boxShadow: AppTheme.softShadow,
            ),
            child: Text(
              badgeText,
              style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: AppTheme.charcoal,
              ),
            ),
          ),
          const SizedBox(height: 4),
        ] else ...[
          const SizedBox(height: 18),
        ],

        // Vertical Capsule Bar
        Container(
          width: 9,
          height: 52 * heightRatio,
          decoration: BoxDecoration(
            color: isHighlight ? AppTheme.accentYellow : AppTheme.charcoal,
            borderRadius: BorderRadius.circular(999),
          ),
        ),
        const SizedBox(height: 3),

        // Base Dot Connector
        Container(
          width: 5,
          height: 5,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isHighlight ? AppTheme.accentYellowDeep : const Color(0xFFD6CEBF),
          ),
        ),
        const SizedBox(height: 4),

        // Day Monospace Label
        Text(
          day,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            color: AppTheme.textMuted,
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // SECTION 4: BENTO CARD 3 - 270° SUNLIT BUTTER YELLOW ARC DIAL GAUGE
  // =========================================================================
  Widget _buildDialGaugeCard(double temp, double doVal) {
    // Normalization: 20°C to 30°C -> 0.0 to 1.0
    final norm = ((temp - 20) / 10).clamp(0.0, 1.0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Suhu Air & Oksigen (DO)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderMedium),
                ),
                child: const Icon(Icons.arrow_outward_rounded, size: 14, color: AppTheme.textSecondary),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Custom Circular Arc Gauge Instrument
          Center(
            child: SizedBox(
              width: 160,
              height: 130,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  CustomPaint(
                    size: const Size(160, 130),
                    painter: DialArcPainter(
                      normalizedValue: norm,
                      arcColor: AppTheme.accentYellow,
                      trackColor: const Color(0xFFF1F5F9),
                    ),
                  ),

                  // Center Readout
                  Positioned(
                    top: 40,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        RichText(
                          text: TextSpan(
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w300,
                              letterSpacing: -0.8,
                              fontFamily: 'monospace',
                              color: AppTheme.textPrimary,
                            ),
                            children: [
                              TextSpan(text: temp.toStringAsFixed(1)),
                              const TextSpan(
                                text: '°C',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'DO ${doVal.toStringAsFixed(2)} mg/L',
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Telemetry Live Chip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.leafGreen,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Siklus Telemetri 1.5s',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
              const Text(
                'Saturasi Oksigen Prima ✨',
                style: TextStyle(
                  fontSize: 10,
                  fontStyle: FontStyle.italic,
                  color: AppTheme.leafGreen,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // SECTION 5: BENTO CARD 4 - MATTE CHARCOAL TASK & AUTOMATION PANEL
  // =========================================================================
  Widget _buildDarkTaskPanel(
    dynamic telemetry,
    dynamic notifier,
    int activeCount,
    int totalCount,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(28),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Otomasi Perangkat & Tugas',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              Text(
                '$activeCount/$totalCount Aktif',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppTheme.accentYellow,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Mini Segmented Progress Pill
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.accentYellow,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$activeCount Aktif',
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.charcoal,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '${totalCount - activeCount} Standby',
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // List of Relays
          ...telemetry.actuators.entries.map((entry) {
            final id = entry.key;
            final act = entry.value;

            return InkWell(
              onTap: () {
                HapticFeedback.heavyImpact();
                notifier.toggleActuator(id);
              },
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 7),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _getActuatorIcon(id),
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              act.name,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              '${act.powerWatts} Watt • Relay Fisik',
                              style: const TextStyle(
                                fontSize: 9.5,
                                fontFamily: 'monospace',
                                color: Color(0x99FFFFFF),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Butter Yellow Checkbox Circle
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: act.isOn ? AppTheme.accentYellow : Colors.transparent,
                        shape: BoxShape.circle,
                        border: act.isOn ? null : Border.all(color: Colors.white.withValues(alpha: 0.25)),
                      ),
                      child: act.isOn
                          ? const Icon(Icons.check, size: 13, color: AppTheme.charcoal)
                          : null,
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  // =========================================================================
  // SECTION 6: QUICK FEED DISPENSER
  // =========================================================================
  Widget _buildQuickFeedPill(dynamic telemetry, dynamic notifier) {
    final isFeeding = telemetry.feedActive;

    return InkWell(
      onTap: () {
        HapticFeedback.heavyImpact();
        notifier.dispenseFeed();
      },
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        decoration: BoxDecoration(
          color: isFeeding ? AppTheme.leafGreen : AppTheme.alertCoral,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppTheme.softShadow,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isFeeding ? Icons.check_circle_rounded : Icons.send_rounded,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 8),
            Text(
              isFeeding ? '35g Pakan Telah Didistribusikan! ✨' : 'Beri Pakan Ikan Sekarang (Dispense Feed)',
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getActuatorIcon(String id) {
    switch (id) {
      case 'waterPump':
        return Icons.waves_rounded;
      case 'aerator':
        return Icons.air_rounded;
      case 'growLight':
        return Icons.wb_sunny_rounded;
      case 'feeder':
        return Icons.set_meal_rounded;
      default:
        return Icons.power_rounded;
    }
  }
}

// ===========================================================================
// 270° CIRCULAR ARC DIAL GAUGE PAINTER
// ===========================================================================
class DialArcPainter extends CustomPainter {
  final double normalizedValue;
  final Color arcColor;
  final Color trackColor;

  DialArcPainter({
    required this.normalizedValue,
    required this.arcColor,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2 + 10);
    final radius = size.width / 2 - 20;

    // Outer Dashed Ticks (24 dots around ring)
    final tickPaint = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke;

    for (int i = 0; i < 28; i++) {
      final angle = (i * 360 / 28) * math.pi / 180;
      final p1 = Offset(center.dx + (radius + 8) * math.cos(angle), center.dy + (radius + 8) * math.sin(angle));
      final p2 = Offset(center.dx + (radius + 12) * math.cos(angle), center.dy + (radius + 12) * math.sin(angle));
      canvas.drawLine(p1, p2, tickPaint);
    }

    // 270° Sweep Track (from 135° to 405°)
    const startAngle = 135 * math.pi / 180;
    const sweepTotal = 270 * math.pi / 180;

    final trackPaint = Paint()
      ..color = trackColor
      ..strokeWidth = 11
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal,
      false,
      trackPaint,
    );

    // Active Butter Yellow Arc
    final activePaint = Paint()
      ..color = arcColor
      ..strokeWidth = 11
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final sweepActive = sweepTotal * normalizedValue.clamp(0.0, 1.0);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepActive,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant DialArcPainter oldDelegate) {
    return oldDelegate.normalizedValue != normalizedValue || oldDelegate.arcColor != arcColor;
  }
}
