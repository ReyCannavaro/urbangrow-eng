import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/telemetry/presentation/telemetry_notifier.dart';

class ControlsScreen extends ConsumerWidget {
  const ControlsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

    final totalWatts = telemetry.actuators.values.fold<int>(
      0,
      (acc, act) => acc + (act.isOn ? act.powerWatts : 0),
    );

    final dailyKWh = ((totalWatts * 24) / 1000).toStringAsFixed(2);

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Industrial Power Watt Meter Header
            _buildPowerMeterInstrument(totalWatts, dailyKWh),

            const SizedBox(height: 24),

            // 2. Section Header: Relay Hardware Hub
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'PANEL SAKLAR RELAY FISIK (OPTOCOUPLER)',
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    letterSpacing: 1.1,
                    color: AppTheme.textMuted,
                  ),
                ),
                Text(
                  '${telemetry.actuators.values.where((a) => a.isOn).length} AKTIF',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.leafGreen,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 3. Tactile Hardware Switch Cards
            ...telemetry.actuators.entries.map((entry) {
              final id = entry.key;
              final act = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildTactileRelayCard(
                  id: id,
                  code: _getRelayCode(id),
                  name: act.name,
                  powerWatts: act.powerWatts,
                  isOn: act.isOn,
                  accentColor: _getActuatorColor(id),
                  onToggle: () {
                    HapticFeedback.heavyImpact();
                    notifier.toggleActuator(id);
                  },
                ),
              );
            }),

            const SizedBox(height: 16),

            // 4. Clean Schedule Timers Block
            _buildScheduleTimetable(),

            const SizedBox(height: 16),

            // 5. Emergency Kill Switch
            _buildEmergencyKillSwitch(context),

            const SizedBox(height: 90),
          ],
        ),
      ),
    );
  }

  Widget _buildPowerMeterInstrument(int totalWatts, String dailyKWh) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: AppTheme.floatingPillShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.bolt_rounded, color: AppTheme.bioAmberLight, size: 18),
                  SizedBox(width: 6),
                  Text(
                    'TOTAL DAYA AKTUAL',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 1.1,
                      color: AppTheme.textLight,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.leafGreen.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  '12V DC HYBRID',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.leafGreenLight,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                totalWatts.toString(),
                style: const TextStyle(
                  fontSize: 52,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -2.0,
                  color: Colors.white,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'WATT',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppTheme.bioAmberLight,
                ),
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$dailyKWh kWh / hari',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: Colors.white,
                    ),
                  ),
                  const Text(
                    'Estimasi Konsumsi Harian',
                    style: TextStyle(
                      fontSize: 10,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTactileRelayCard({
    required String id,
    required String code,
    required String name,
    required int powerWatts,
    required bool isOn,
    required Color accentColor,
    required VoidCallback onToggle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isOn ? accentColor.withValues(alpha: 0.6) : AppTheme.borderLight,
          width: isOn ? 1.6 : 1.0,
        ),
        boxShadow: AppTheme.softShadow,
      ),
      child: Row(
        children: [
          // Code Box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: isOn ? accentColor.withValues(alpha: 0.12) : AppTheme.canvas,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              code,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: isOn ? accentColor : AppTheme.textSecondary,
              ),
            ),
          ),
          const SizedBox(width: 14),

          // Name and Wattage
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'Beban: ${powerWatts}W • Catu 12V',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Tactile Mechanical Toggle Switch
          Transform.scale(
            scale: 0.95,
            child: Switch.adaptive(
              value: isOn,
              activeThumbColor: accentColor,
              activeTrackColor: accentColor.withValues(alpha: 0.35),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: AppTheme.borderMedium,
              onChanged: (_) => onToggle(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleTimetable() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppTheme.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'JADWAL OTOMASI PERANGKAT',
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              letterSpacing: 1.0,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 12),
          _buildScheduleRow('Feeder Ikan', '07:00 & 16:30 WIB', 'Porsi 35g', AppTheme.leafGreen),
          const Divider(height: 18),
          _buildScheduleRow('LED Grow Light', '18:00 - 06:00 WIB', '12 Jam PPFD', AppTheme.bioAmber),
          const Divider(height: 18),
          _buildScheduleRow('Pompa Sirkulasi', '24 Jam Non-Stop', 'Closed-Loop', AppTheme.aquaticCyan),
        ],
      ),
    );
  }

  Widget _buildScheduleRow(String title, String time, String note, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            Text(
              time,
              style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            note,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmergencyKillSwitch(BuildContext context) {
    return InkWell(
      onTap: () {
        HapticFeedback.heavyImpact();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sistem pengaman relay standby.'),
            backgroundColor: AppTheme.charcoal,
          ),
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppTheme.alertCoral.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.alertCoral.withValues(alpha: 0.3)),
        ),
        child: const Row(
          children: [
            Icon(Icons.power_settings_new_rounded, color: AppTheme.alertCoral, size: 22),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Emergency Safety Lock',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.alertCoral,
                    ),
                  ),
                  Text(
                    'Matikan seluruh aktuator seketika saat perbaikan kolam',
                    style: TextStyle(fontSize: 10.5, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            Text(
              'STANDBY',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: AppTheme.alertCoral,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getRelayCode(String id) {
    switch (id) {
      case 'waterPump':
        return 'REL-01';
      case 'aerator':
        return 'REL-02';
      case 'growLight':
        return 'REL-03';
      case 'feeder':
        return 'REL-04';
      default:
        return 'REL-05';
    }
  }

  Color _getActuatorColor(String id) {
    switch (id) {
      case 'waterPump':
        return AppTheme.aquaticCyan;
      case 'aerator':
        return AppTheme.leafGreen;
      case 'growLight':
        return AppTheme.bioAmber;
      case 'feeder':
        return const Color(0xFF6366F1);
      default:
        return AppTheme.alertCoral;
    }
  }
}
