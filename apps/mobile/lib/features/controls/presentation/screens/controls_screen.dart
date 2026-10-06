import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';

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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Title Header
            _buildHeaderCard(),

            const SizedBox(height: 16),

            // Big Power Wattage Gauge Bento Card
            _buildPowerBentoCard(totalWatts, dailyKWh),

            const SizedBox(height: 20),

            // Relay Controls Section Label
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '4-CHANNEL OPTOCOUPLER RELAY HUB',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    letterSpacing: 1.0,
                    color: AppTheme.textMuted,
                  ),
                ),
                Text(
                  'ESP32 GPIO ACTIVE',
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

            // List of Actuators
            ...telemetry.actuators.entries.map((entry) {
              final id = entry.key;
              final act = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildTactileRelayCard(
                  id: id,
                  code: _getRelayCode(id),
                  name: act.name,
                  voltage: '12V DC',
                  powerWatts: act.powerWatts,
                  isOn: act.isOn,
                  icon: _getActuatorIcon(id),
                  accentColor: _getActuatorColor(id),
                  onToggle: () {
                    HapticFeedback.mediumImpact();
                    notifier.toggleActuator(id);
                  },
                ),
              );
            }),

            const SizedBox(height: 12),

            // Automated Schedule Timers
            _buildScheduleTimersCard(),

            const SizedBox(height: 16),

            // Emergency Safety Lock
            _buildEmergencyLockCard(context),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.accentYellow.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.toggle_on_rounded,
              color: AppTheme.accentYellowDeep,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pusat Kontrol Aktuator',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'ESP32 DevKit V1 • Relay Switching & Smart Power',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPowerBentoCard(int totalWatts, String dailyKWh) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(28),
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
                  Icon(Icons.bolt_rounded, color: AppTheme.accentYellow, size: 20),
                  SizedBox(width: 6),
                  Text(
                    'KONSUMSI DAYA AKTUAL',
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
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.accentEmerald.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'HYBRID SOLAR ACTIVE',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.accentEmerald,
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
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -1.5,
                  color: Colors.white,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'Watt',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.accentYellow,
                ),
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$dailyKWh kWh/hari',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: Colors.white,
                    ),
                  ),
                  const Text(
                    'Estimasi Beban Listrik',
                    style: TextStyle(
                      fontSize: 10,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Progress load bar (max 250W)
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: (totalWatts / 250).clamp(0.05, 1.0),
              minHeight: 6,
              backgroundColor: AppTheme.charcoalSoft,
              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentYellow),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTactileRelayCard({
    required String id,
    required String code,
    required String name,
    required String voltage,
    required int powerWatts,
    required bool isOn,
    required IconData icon,
    required Color accentColor,
    required VoidCallback onToggle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isOn ? accentColor.withValues(alpha: 0.5) : AppTheme.borderLight,
          width: isOn ? 1.5 : 1.0,
        ),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isOn
                  ? accentColor.withValues(alpha: 0.15)
                  : AppTheme.canvas,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(
              icon,
              color: isOn ? accentColor : AppTheme.textMuted,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.canvas,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: Text(
                        code,
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '$voltage • ${powerWatts}W',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  isOn ? 'STATUS: AKTIF BERJALAN' : 'STATUS: MATI (STANDBY)',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: isOn ? AppTheme.accentEmeraldDark : AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Custom Switch
          Transform.scale(
            scale: 0.9,
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

  Widget _buildScheduleTimersCard() {
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
          const Row(
            children: [
              Icon(Icons.schedule_rounded, color: AppTheme.charcoal, size: 18),
              SizedBox(width: 8),
              Text(
                'JADWAL OTOMASI TIMER',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  letterSpacing: 0.8,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildScheduleItem(
            'Feeder Pakan Ikan',
            'Pukul 07:00 & 16:30 WIB (2x / hari)',
            'Porsi 35 gram otomatis',
            Icons.fastfood_rounded,
          ),
          const Divider(height: 18),
          _buildScheduleItem(
            'LED Grow Light',
            '18:00 - 06:00 WIB (Fotoperiode 12 Jam)',
            'Mendukung spektrum fotosintesis Pakcoy',
            Icons.light_mode_rounded,
          ),
          const Divider(height: 18),
          _buildScheduleItem(
            'Sirkulasi Pompa Air',
            '24 Jam Berkelanjutan (Continuous)',
            'Resirkulasi air tertutup biofilter',
            Icons.water_drop_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleItem(String title, String time, String desc, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppTheme.textSecondary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.canvas,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'OTOMATIS',
                      style: TextStyle(
                        fontSize: 8.5,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: AppTheme.accentEmeraldDark,
                      ),
                    ),
                  ),
                ],
              ),
              Text(
                time,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
              Text(
                desc,
                style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmergencyLockCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.accentCoral.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.accentCoral.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: AppTheme.accentCoral, size: 24),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Emergency Stop Lock',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.accentCoral,
                  ),
                ),
                Text(
                  'Matikan seluruh relay seketika saat perawatan darurat',
                  style: TextStyle(
                    fontSize: 10.5,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Sistem pengaman darurat dalam status siap siaga.'),
                  backgroundColor: AppTheme.charcoal,
                ),
              );
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.accentCoral,
              side: const BorderSide(color: AppTheme.accentCoral),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            ),
            child: const Text('STANDBY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String _getRelayCode(String id) {
    switch (id) {
      case 'waterPump':
        return 'RELAY-01';
      case 'aerator':
        return 'RELAY-02';
      case 'growLight':
        return 'RELAY-03';
      case 'feeder':
        return 'RELAY-04';
      default:
        return 'RELAY-05';
    }
  }

  IconData _getActuatorIcon(String id) {
    switch (id) {
      case 'waterPump':
        return Icons.water_drop_rounded;
      case 'aerator':
        return Icons.air_rounded;
      case 'growLight':
        return Icons.lightbulb_rounded;
      case 'feeder':
        return Icons.fastfood_rounded;
      default:
        return Icons.science_rounded;
    }
  }

  Color _getActuatorColor(String id) {
    switch (id) {
      case 'waterPump':
        return AppTheme.accentCyan;
      case 'aerator':
        return AppTheme.accentEmerald;
      case 'growLight':
        return AppTheme.accentYellowDeep;
      case 'feeder':
        return AppTheme.accentIndigo;
      default:
        return AppTheme.accentCoral;
    }
  }
}
