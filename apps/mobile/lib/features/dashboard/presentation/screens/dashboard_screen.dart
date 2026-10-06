import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';
import '../../../alerts/presentation/widgets/alerts_modal_sheet.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

    final totalWatts = telemetry.actuators.values.fold<int>(
      0,
      (acc, act) => acc + (act.isOn ? act.powerWatts : 0),
    );

    final todayFormatted = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(DateTime.now());

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: RefreshIndicator(
        onRefresh: () async => notifier.fetchLatest(),
        color: AppTheme.charcoal,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Welcome Bento Card
              _buildHeroWelcomeCard(todayFormatted, telemetry),

              const SizedBox(height: 16),

              // WQI Dial Card (Matching Web DialGaugeCard)
              _buildWQIDialCard(),

              const SizedBox(height: 20),

              // Section Title: Telemetry
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'TELEMETRI KUALITAS AIR REAL-TIME',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 1.0,
                      color: AppTheme.textMuted,
                    ),
                  ),
                  Text(
                    'CYCLE 1.5s',
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: AppTheme.accentEmeraldDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 6 Telemetry Metrics Grid (2 columns x 3 rows)
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.18,
                children: [
                  _buildSensorCard(
                    title: 'Kadar pH',
                    value: telemetry.sensors.ph.toStringAsFixed(2),
                    unit: 'pH',
                    target: 'Target 6.5 - 7.5',
                    statusText: telemetry.sensors.ph >= 6.5 && telemetry.sensors.ph <= 7.5
                        ? 'Sangat Sehat'
                        : 'Perlu Buffer',
                    accentColor: AppTheme.accentEmerald,
                    icon: Icons.science_rounded,
                  ),
                  _buildSensorCard(
                    title: 'Suhu Air',
                    value: telemetry.sensors.waterTemperature.toStringAsFixed(1),
                    unit: '°C',
                    target: 'Ideal 24 - 28°C',
                    statusText: telemetry.sensors.waterTemperature <= 28.0
                        ? 'Suhu Ideal'
                        : 'Waspada Hangat',
                    accentColor: AppTheme.accentCyan,
                    icon: Icons.thermostat_rounded,
                  ),
                  _buildSensorCard(
                    title: 'Oksigen (DO)',
                    value: telemetry.sensors.dissolvedOxygen.toStringAsFixed(2),
                    unit: 'mg/L',
                    target: 'Target > 5.0 mg/L',
                    statusText: telemetry.sensors.dissolvedOxygen >= 5.0
                        ? 'Kaya Oksigen'
                        : 'Hipoksia Kritis',
                    accentColor: AppTheme.accentIndigo,
                    icon: Icons.bubble_chart_rounded,
                  ),
                  _buildSensorCard(
                    title: 'TDS Nutrisi',
                    value: telemetry.sensors.tds.toString(),
                    unit: 'ppm',
                    target: 'Target 500 - 800',
                    statusText: 'Nutrisi Seimbang',
                    accentColor: AppTheme.accentYellowDeep,
                    icon: Icons.eco_rounded,
                  ),
                  _buildSensorCard(
                    title: 'Suhu Udara',
                    value: telemetry.sensors.airTemperature.toStringAsFixed(1),
                    unit: '°C',
                    target: 'Ambient 27°C',
                    statusText: '${telemetry.sensors.humidity.toStringAsFixed(0)}% RH Lembap',
                    accentColor: const Color(0xFFF97316),
                    icon: Icons.wb_sunny_rounded,
                  ),
                  _buildSensorCard(
                    title: 'Level Air Tangki',
                    value: telemetry.sensors.waterLevel.toStringAsFixed(1),
                    unit: '%',
                    target: 'Kapasitas 100%',
                    statusText: 'Volume Penuh',
                    accentColor: AppTheme.accentSlate,
                    icon: Icons.water_rounded,
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Dark Task Panel (Total wattage, Node, WiFi dBm)
              _buildDarkTaskPanel(totalWatts, telemetry),

              const SizedBox(height: 20),

              // Quick Actions Panel
              _buildQuickActionsPanel(context, telemetry, notifier),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroWelcomeCard(String todayFormatted, dynamic telemetry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
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
              Text(
                todayFormatted.toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  letterSpacing: 0.8,
                  color: AppTheme.textMuted,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.accentEmerald.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppTheme.accentEmerald.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.shield_rounded, color: AppTheme.accentEmeraldDark, size: 12),
                    SizedBox(width: 4),
                    Text(
                      '98% BIOLOGIS SEIMBANG',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: AppTheme.accentEmeraldDark,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Urban Farm 01',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Sistem Akuaponik Kaskade 4-Level • Zero Chemical Symbiosis',
            style: TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          // 4-Level Cascade Segment Bar
          Row(
            children: [
              _buildSegmentPill('L4', 'Pakcoy', AppTheme.accentEmerald),
              const SizedBox(width: 6),
              _buildSegmentPill('L3', 'Nila', AppTheme.accentCyan),
              const SizedBox(width: 6),
              _buildSegmentPill('L2', 'Kangkung', AppTheme.accentYellowDeep),
              const SizedBox(width: 6),
              _buildSegmentPill('L1', 'Lele', AppTheme.accentSlate),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentPill(String level, String plant, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(
              level,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: color,
              ),
            ),
            const SizedBox(height: 1),
            Text(
              plant,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWQIDialCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardBg,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.borderMedium),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          // Circular Progress Dial
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 72,
                height: 72,
                child: CircularProgressIndicator(
                  value: 0.94,
                  strokeWidth: 7,
                  backgroundColor: AppTheme.borderLight,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentEmerald),
                  strokeCap: StrokeCap.round,
                ),
              ),
              const Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '94',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                      color: AppTheme.charcoal,
                    ),
                  ),
                  Text(
                    'WQI',
                    style: TextStyle(
                      fontSize: 8.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Water Quality Index (WQI)',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                SizedBox(height: 3),
                Text(
                  'Stabilitas pH 96% • DO Saturasi 98% • Buffer Organik',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Kualitas air dalam kisaran prima untuk ikan dan tanaman.',
                  style: TextStyle(
                    fontSize: 10.5,
                    fontStyle: FontStyle.italic,
                    color: AppTheme.accentEmeraldDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSensorCard({
    required String title,
    required String value,
    required String unit,
    required String target,
    required String statusText,
    required Color accentColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
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
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                ),
              ),
              Icon(icon, size: 16, color: accentColor),
            ],
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'monospace',
                  letterSpacing: -0.8,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(width: 3),
              Text(
                unit,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: accentColor,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                statusText,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: accentColor,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                target,
                style: const TextStyle(
                  fontSize: 9,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDarkTaskPanel(int totalWatts, dynamic telemetry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.terminal_rounded, color: AppTheme.accentYellow, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'STATUS SISTEM PERANGKAT EDGE',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 0.8,
                      color: AppTheme.textLight,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.accentYellow.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$totalWatts WATT AKTIF',
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.accentYellow,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildDarkStatItem('Node Microcontroller', 'ESP32 DevKit V1', Icons.memory_rounded),
              _buildDarkStatItem('Konektivitas WiFi', '-56 dBm (Kuat)', Icons.wifi_rounded),
              _buildDarkStatItem('Mode Mesin', 'Generative Sim', Icons.sync_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDarkStatItem(String label, String value, IconData icon) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 9.5,
                    color: AppTheme.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              color: Colors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsPanel(
    BuildContext context,
    dynamic telemetry,
    dynamic notifier,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'AKSI CEPAT OPERASIONAL',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              letterSpacing: 0.8,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              // Dispense Feed Button
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: telemetry.isFeedDispensing
                      ? null
                      : () {
                          HapticFeedback.heavyImpact();
                          notifier.dispenseFeed();
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.charcoal,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  icon: telemetry.isFeedDispensing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.fastfood_rounded, size: 18),
                  label: Text(
                    telemetry.isFeedDispensing
                        ? 'Mengeluarkan...'
                        : 'Beri Pakan Ikan',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Anomaly Test Trigger
              OutlinedButton.icon(
                onPressed: () {
                  AlertsModalSheet.show(
                    context,
                    activeAnomaly: telemetry.anomalyMode,
                    onSelectAnomaly: notifier.setAnomaly,
                    isBackendLive: telemetry.isLive,
                  );
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.charcoal,
                  side: const BorderSide(color: AppTheme.borderMedium),
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                icon: const Icon(Icons.tune_rounded, size: 18),
                label: const Text(
                  'Uji Anomali',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
