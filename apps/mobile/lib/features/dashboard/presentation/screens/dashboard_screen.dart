import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  final VoidCallback? onOpenTowerTab;
  final VoidCallback? onOpenControlsTab;

  const DashboardScreen({
    super.key,
    this.onOpenTowerTab,
    this.onOpenControlsTab,
  });

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _runtimeSeconds = 5048; // Baseline 01:24:08

  @override
  void initState() {
    super.initState();
    // Increment digital runtime clock every second
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _runtimeSeconds++);
      return true;
    });
  }

  String _formatTimer(int totalSec) {
    final hrs = (totalSec ~/ 3600).toString().padLeft(2, '0');
    final mins = ((totalSec % 3600) ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSec % 60).toString().padLeft(2, '0');
    return '$hrs:$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

    final activeActuators = telemetry.actuators.values.where((a) => a.isOn).length;
    final totalActuators = telemetry.actuators.length;
    final totalWatts = telemetry.actuators.values.fold<int>(
      0,
      (sum, a) => sum + (a.isOn ? a.powerWatts : 0),
    );

    // Dynamic WQI Score calculation (matching Web Dashboard)
    final wqiScore = (100 -
            ((telemetry.sensors.ph - 7.0).abs() * 16) -
            (math.max(0.0, 6.5 - telemetry.sensors.dissolvedOxygen) * 8) -
            ((telemetry.sensors.waterTemperature - 24.5).abs() * 2.5))
        .clamp(50.0, 98.0)
        .round();

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: RefreshIndicator(
        onRefresh: () async => notifier.fetchLatest(),
        color: AppTheme.pinePrimary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Welcome Header (Donezo Console Headline)
              _buildGreetingHeader(),

              const SizedBox(height: 16),

              // 2. Donezo 2x2 Bento Metric Grid (Pine Hero Inverted + 3 White Cards)
              _buildBentoMetricGrid(telemetry, wqiScore),

              const SizedBox(height: 16),

              // 3. Cycle Analytics Capsule Bar Chart (Donezo Row 2, Card 1)
              _buildCycleAnalyticsCard(telemetry.sensors.ph),

              const SizedBox(height: 16),

              // 4. Reminders & Feed Action Card (Donezo Row 2, Card 2)
              _buildRemindersCard(telemetry, notifier),

              const SizedBox(height: 16),

              // 5. Relay Actuators Bento Card with Donezo Sliding Toggles
              _buildRelayActuatorsCard(telemetry, notifier, activeActuators, totalActuators),

              const SizedBox(height: 16),

              // 6. Biological Pairs List (ECAD Pasangan Biologis)
              _buildBiologicalPairsCard(),

              const SizedBox(height: 16),

              // 7. Semicircular Biofilter Donut Card (Donezo Row 3, Card 2)
              _buildBiofilterDonutCard(),

              const SizedBox(height: 16),

              // 8. Dark Wave Hardware Edge Time Tracker Card (Donezo Row 3, Card 3)
              _buildHardwareEdgeTrackerCard(totalWatts),

              const SizedBox(height: 96),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // 1. GREETING HEADLINE
  // =========================================================================
  Widget _buildGreetingHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Dashboard Ekosistem',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.6,
                    color: AppTheme.textPrimary,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Sistem Kaskade 4-Baris & Kolam Bersekat',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.mintWash,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppTheme.statusOptimal.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.eco_rounded, size: 12, color: AppTheme.statusOptimal),
                  SizedBox(width: 4),
                  Text(
                    'ECAD Active',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.mintText,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  // =========================================================================
  // 2. DONEZO 2X2 BENTO METRIC GRID
  // =========================================================================
  Widget _buildBentoMetricGrid(dynamic telemetry, int wqiScore) {
    return Column(
      children: [
        Row(
          children: [
            // Card 1: INVERTED HERO CARD (Pine Forest Green #165B39)
            Expanded(
              child: Container(
                height: 165,
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: AppTheme.pinePrimary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: AppTheme.softShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Kualitas Air',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        Container(
                          width: 28,
                          height: 28,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_outward_rounded,
                            size: 15,
                            color: AppTheme.pinePrimary,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            style: const TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                              letterSpacing: -1.0,
                              color: Colors.white,
                            ),
                            children: [
                              TextSpan(text: '$wqiScore'),
                              const TextSpan(
                                text: '%',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.normal,
                                  color: Colors.white70,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.18),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.trending_up_rounded, size: 11, color: AppTheme.sageMint),
                              SizedBox(width: 3),
                              Text(
                                '+4.2% Stabil',
                                style: TextStyle(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Card 2: Suhu Air Kolam (White Bento)
            Expanded(
              child: _buildWhiteMetricCard(
                title: 'Suhu Kolam',
                value: telemetry.sensors.waterTemperature.toStringAsFixed(1),
                unit: '°C',
                badgeText: '24-28°C Ideal',
                icon: Icons.thermostat_rounded,
                accentColor: AppTheme.accentCyan,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // Card 3: Oksigen Terlarut DO (White Bento)
            Expanded(
              child: _buildWhiteMetricCard(
                title: 'Oksigen (DO)',
                value: telemetry.sensors.dissolvedOxygen.toStringAsFixed(2),
                unit: 'mg/L',
                badgeText: 'Saturasi 98%',
                icon: Icons.waves_rounded,
                accentColor: AppTheme.accentCyan,
              ),
            ),
            const SizedBox(width: 12),

            // Card 4: pH Air (White Bento)
            Expanded(
              child: _buildWhiteMetricCard(
                title: 'Kadar pH Air',
                value: telemetry.sensors.ph.toStringAsFixed(2),
                unit: 'pH',
                badgeText: 'Buffer 6.5-7.5',
                icon: Icons.water_drop_rounded,
                accentColor: AppTheme.pinePrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWhiteMetricCard({
    required String title,
    required String value,
    required String unit,
    required String badgeText,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      height: 165,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderLight),
                ),
                child: Icon(
                  Icons.arrow_outward_rounded,
                  size: 14,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              RichText(
                text: TextSpan(
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    letterSpacing: -0.8,
                    color: AppTheme.textPrimary,
                  ),
                  children: [
                    TextSpan(text: value),
                    TextSpan(
                      text: ' $unit',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.normal,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.mintWash,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_rounded, size: 10, color: AppTheme.mintText),
                    const SizedBox(width: 3),
                    Text(
                      badgeText,
                      style: const TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.mintText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 3. CYCLE ANALYTICS CAPSULE BAR CHART (Donezo Row 2, Card 1)
  // =========================================================================
  Widget _buildCycleAnalyticsCard(double currentPh) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Analisis Siklus Mingguan',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Fotosintesis & Aktivitas Biologis 7 Hari',
                    style: TextStyle(fontSize: 10.5, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceSubtle,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppTheme.borderLight),
                ),
                child: const Text(
                  '74% Rata-rata',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.pinePrimary,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // 7 Days Capsule Bars
          SizedBox(
            height: 110,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _buildCapsuleBar('S', 0.40, false, ''),
                _buildCapsuleBar('M', 0.65, false, ''),
                _buildCapsuleBar('T', 0.50, false, ''),
                _buildCapsuleBar('W', 0.55, false, ''),
                _buildCapsuleBar('T', 0.75, false, ''),
                _buildCapsuleBar('F', 0.90, true, '${currentPh.toStringAsFixed(2)} pH'),
                _buildCapsuleBar('S', 0.45, false, ''),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCapsuleBar(String day, double ratio, bool isPeak, String tooltip) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (isPeak) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppTheme.pinePrimary,
              borderRadius: BorderRadius.circular(999),
              boxShadow: AppTheme.softShadow,
            ),
            child: Text(
              tooltip,
              style: const TextStyle(
                fontSize: 8.5,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 4),
        ] else ...[
          const SizedBox(height: 18),
        ],

        // Capsule Bar
        Container(
          width: 14,
          height: 60 * ratio,
          decoration: BoxDecoration(
            color: isPeak ? AppTheme.pinePrimary : AppTheme.surfaceSubtle,
            border: isPeak ? null : Border.all(color: AppTheme.borderLight),
            borderRadius: BorderRadius.circular(999),
          ),
        ),

        const SizedBox(height: 6),

        Text(
          day,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isPeak ? FontWeight.bold : FontWeight.w600,
            fontFamily: 'monospace',
            color: isPeak ? AppTheme.pinePrimary : AppTheme.textMuted,
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // 4. REMINDERS & AUTOMATION CARD (Donezo Row 2, Card 2)
  // =========================================================================
  Widget _buildRemindersCard(dynamic telemetry, dynamic notifier) {
    final isFeeding = telemetry.feedActive;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'Reminders & Jadwal Pakan',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Icon(Icons.access_time_rounded, size: 16, color: AppTheme.textSecondary),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'Pemberian Pakan Siang (35g)',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppTheme.pinePrimary,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Target: Tandon Nila L3 & Kolam Lele L1 • Pelet Terapung 2mm',
            style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
          ),

          const SizedBox(height: 14),

          // Primary Pine Pill Feed Action Button
          InkWell(
            onTap: () {
              HapticFeedback.heavyImpact();
              notifier.dispenseFeed();
            },
            borderRadius: BorderRadius.circular(999),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: isFeeding ? AppTheme.mintText : AppTheme.pinePrimary,
                borderRadius: BorderRadius.circular(999),
                boxShadow: AppTheme.softShadow,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isFeeding ? Icons.check_circle_rounded : Icons.add_circle_outline_rounded,
                    size: 16,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isFeeding ? '35g Pakan Telah Keluar! ✨' : '+ Beri Pakan Sekarang',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 5. RELAY ACTUATORS CARD (Donezo Bento with Sliding Toggles)
  // =========================================================================
  Widget _buildRelayActuatorsCard(
    dynamic telemetry,
    dynamic notifier,
    int activeCount,
    int totalCount,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
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
                'Kontrol Relay Aktuator',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.mintWash,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$activeCount/$totalCount Aktif',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.mintText,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // List of relays with Donezo sliding toggle switch
          ...telemetry.actuators.entries.map((entry) {
            final id = entry.key;
            final act = entry.value;

            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: act.isOn ? AppTheme.mintWash : AppTheme.surfaceSubtle,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _getActuatorIcon(id),
                          size: 16,
                          color: act.isOn ? AppTheme.pinePrimary : AppTheme.textMuted,
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
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            '${act.powerWatts}W • ${act.voltage}',
                            style: const TextStyle(
                              fontSize: 9.5,
                              fontFamily: 'monospace',
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Donezo Tactile Sliding Toggle Switch
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      notifier.toggleActuator(id);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 44,
                      height: 24,
                      padding: const EdgeInsets.all(2.5),
                      decoration: BoxDecoration(
                        color: act.isOn ? AppTheme.pinePrimary : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: AnimatedAlign(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeOutCubic,
                        alignment: act.isOn ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          width: 19,
                          height: 19,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Color(0x20000000),
                                blurRadius: 4,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // =========================================================================
  // 6. BIOLOGICAL PAIRS LIST (Donezo Row 3, Card 1)
  // =========================================================================
  Widget _buildBiologicalPairsCard() {
    final pairs = [
      {'level': 'Level 4', 'name': 'Pakcoy Hidroponik', 'status': 'Sehat • 180g/pod', 'badge': 'Optimal', 'color': AppTheme.pinePrimary},
      {'level': 'Level 3', 'name': 'Ikan Nila Merah', 'status': 'Aktif • DO 7.11 mg/L', 'badge': 'Optimal', 'color': AppTheme.accentCyan},
      {'level': 'Level 2', 'name': 'Kangkung Biofilter', 'status': 'Nitrifikasi 94%', 'badge': 'Buffer', 'color': AppTheme.accentAmber},
      {'level': 'Level 1', 'name': 'Ikan Lele Dumbo', 'status': 'Solids Sump Aktif', 'badge': 'Optimal', 'color': AppTheme.textSecondary},
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'Pasangan Biologis Ekosistem (ECAD)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Icon(Icons.hub_rounded, size: 16, color: AppTheme.textSecondary),
            ],
          ),
          const SizedBox(height: 12),
          ...pairs.map((p) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: p['color'] as Color,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p['name'] as String,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              '${p['level']} • ${p['status']}',
                              style: const TextStyle(
                                fontSize: 10,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: p['badge'] == 'Optimal' ? AppTheme.mintWash : const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        p['badge'] as String,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: p['badge'] == 'Optimal' ? AppTheme.mintText : const Color(0xFFB45309),
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  // =========================================================================
  // 7. SEMICIRCULAR BIOFILTER DONUT (Donezo Row 3, Card 2)
  // =========================================================================
  Widget _buildBiofilterDonutCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'Efisiensi Konversi Biofilter',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Icon(Icons.pie_chart_rounded, size: 16, color: AppTheme.textSecondary),
            ],
          ),
          const SizedBox(height: 12),
          Center(
            child: SizedBox(
              width: 170,
              height: 100,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  CustomPaint(
                    size: const Size(170, 100),
                    painter: SemicircularGaugePainter(
                      progress: 0.964,
                      color: AppTheme.pinePrimary,
                      trackColor: const Color(0xFFE5E7EB),
                    ),
                  ),
                  Positioned(
                    top: 45,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          '96.4%',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            letterSpacing: -0.8,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          'Amonia ke Nitrat',
                          style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.check_circle_rounded, size: 12, color: AppTheme.mintText),
              SizedBox(width: 4),
              Text(
                'Bakteri Nitrifikasi L2 & L4 Aktif Bekerja',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.mintText,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 8. HARDWARE EDGE TRACKER CARD (Donezo Dark Wavy Panel)
  // =========================================================================
  Widget _buildHardwareEdgeTrackerCard(int totalWatts) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.pineWavy,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Text(
                    'IoT Edge Node Runtime',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.sageMint,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'ESP32 DevKit V1',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Colors.white70,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Large Monospace Clock (Matching Donezo 01:24:08)
          Center(
            child: Text(
              _formatTimer(_runtimeSeconds),
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                letterSpacing: 1.5,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Wattage Chip
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.bolt_rounded, size: 14, color: Color(0xFFFACC15)),
                  const SizedBox(width: 4),
                  Text(
                    '$totalWatts Watt Aktif • WiFi -56 dBm',
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: AppTheme.sageMint,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
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
// SEMICIRCULAR GAUGE PAINTER (180 Degree Donut Arc)
// ===========================================================================
class SemicircularGaugePainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color trackColor;

  SemicircularGaugePainter({
    required this.progress,
    required this.color,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height - 10);
    final radius = size.width / 2 - 15;

    const startAngle = math.pi;
    const sweepTotal = math.pi;

    final trackPaint = Paint()
      ..color = trackColor
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal,
      false,
      trackPaint,
    );

    final activePaint = Paint()
      ..color = color
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal * progress.clamp(0.0, 1.0),
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant SemicircularGaugePainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}
