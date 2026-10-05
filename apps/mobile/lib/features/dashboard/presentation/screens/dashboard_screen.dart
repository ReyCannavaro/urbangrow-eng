import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';
import '../widgets/mobile_header.dart';
import '../widgets/sensor_gauge_card.dart';
import '../widgets/actuator_card.dart';
import '../widgets/quick_actions_panel.dart';

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

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => notifier.fetchLatest(),
          color: AppTheme.charcoal,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Pill
                MobileHeader(
                  isLive: telemetry.isLive,
                  totalWatts: totalWatts,
                ),

                const SizedBox(height: 20),

                // Hero Greeting Card (Warm Editorial Bento)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Urban Farm 01',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Sistem Akuaponik Bertingkat 4-Level • Zero Waste',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 4-Level Compact Segment Bar
                      Row(
                        children: [
                          _buildLevelBadge('L4', 'Pakcoy', AppTheme.accentEmerald),
                          const SizedBox(width: 8),
                          _buildLevelBadge('L3', 'Nila', AppTheme.accentCyan),
                          const SizedBox(width: 8),
                          _buildLevelBadge('L2', 'Kangkung', AppTheme.accentYellowDeep),
                          const SizedBox(width: 8),
                          _buildLevelBadge('L1', 'Lele', const Color(0xFF64748B)),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Telemetry Metrics Grid (2 columns)
                const Text(
                  'Telemetri Kualitas Air',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),

                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.15,
                  children: [
                    SensorGaugeCard(
                      title: 'Kadar pH',
                      value: telemetry.sensors.ph.toStringAsFixed(2),
                      unit: 'pH',
                      statusText: telemetry.sensors.ph >= 6.5 && telemetry.sensors.ph <= 7.5
                          ? 'Optimal (6.5-7.5)'
                          : 'Perhatian Khusus',
                      accentColor: AppTheme.accentEmerald,
                      icon: Icons.science,
                    ),
                    SensorGaugeCard(
                      title: 'Suhu Air',
                      value: telemetry.sensors.waterTemperature.toStringAsFixed(1),
                      unit: '°C',
                      statusText: telemetry.sensors.waterTemperature <= 28.0
                          ? 'Sangat Ideal'
                          : 'Hangat (Waspada)',
                      accentColor: AppTheme.accentCyan,
                      icon: Icons.thermostat,
                    ),
                    SensorGaugeCard(
                      title: 'TDS Nutrisi',
                      value: telemetry.sensors.tds.toString(),
                      unit: 'ppm',
                      statusText: 'Substrat Seimbang',
                      accentColor: AppTheme.accentYellowDeep,
                      icon: Icons.grass,
                    ),
                    SensorGaugeCard(
                      title: 'Oksigen (DO)',
                      value: telemetry.sensors.dissolvedOxygen.toStringAsFixed(2),
                      unit: 'mg/L',
                      statusText: telemetry.sensors.dissolvedOxygen >= 5.0
                          ? 'Kaya Oksigen'
                          : 'Kritis Rendah',
                      accentColor: const Color(0xFF6366F1),
                      icon: Icons.bubble_chart,
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Actuator Controls Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Kontrol Saklar Relay',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      'ESP32 DEVKIT V1',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Actuator Switch Cards List
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: telemetry.actuators.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final key = telemetry.actuators.keys.elementAt(index);
                    final act = telemetry.actuators[key]!;
                    return ActuatorCard(
                      actuator: act,
                      onToggle: (_) => notifier.toggleActuator(act.id),
                    );
                  },
                ),

                const SizedBox(height: 24),

                // Quick Actions Panel
                QuickActionsPanel(
                  onDispenseFeed: notifier.dispenseFeed,
                  isDispensing: telemetry.isFeedDispensing,
                  activeAnomaly: telemetry.anomalyMode,
                  onSelectAnomaly: notifier.setAnomaly,
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLevelBadge(String level, String name, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
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
            const SizedBox(height: 2),
            Text(
              name,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
