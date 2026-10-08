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

    final activeCount = telemetry.actuators.values.where((a) => a.isOn).length;
    final dailyKWh = ((totalWatts * 24) / 1000).toStringAsFixed(2);

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Pine Inverted Hero Power Meter Instrument
            _buildPowerMeterHero(totalWatts, dailyKWh, activeCount),

            const SizedBox(height: 20),

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
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.mintWash,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppTheme.sageMint.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    '$activeCount / ${telemetry.actuators.length} AKTIF',
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

            // 3. Tactile Hardware Switch Cards (Donezo Clean Style)
            ...telemetry.actuators.entries.map((entry) {
              final id = entry.key;
              final act = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildDonezoRelayCard(
                  id: id,
                  code: _getRelayCode(id),
                  name: act.name,
                  powerWatts: act.powerWatts,
                  isOn: act.isOn,
                  icon: _getActuatorIcon(id),
                  onToggle: () {
                    HapticFeedback.heavyImpact();
                    notifier.toggleActuator(id);
                  },
                ),
              );
            }),

            const SizedBox(height: 12),

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

  Widget _buildPowerMeterHero(int totalWatts, String dailyKWh, int activeCount) {
    const maxCapacityWatts = 150;
    final loadRatio = (totalWatts / maxCapacityWatts).clamp(0.0, 1.0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppTheme.pinePrimary,
        borderRadius: BorderRadius.circular(26),
        boxShadow: [
          BoxShadow(
            color: AppTheme.pinePrimary.withValues(alpha: 0.28),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: Label & Hybrid Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.bolt_rounded,
                      color: AppTheme.sageMint,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'TOTAL BEBAN DAYA AKTIF',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 1.1,
                      color: AppTheme.sageMint,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                ),
                child: const Text(
                  '12V DC HYBRID',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Big bold watts display
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                totalWatts.toString(),
                style: const TextStyle(
                  fontSize: 54,
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
                  color: AppTheme.sageMint,
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
                  const SizedBox(height: 2),
                  Text(
                    'Konsumsi ($activeCount Aktif)',
                    style: TextStyle(
                      fontSize: 10.5,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Capacity load progress bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Beban Inverter: ${(loadRatio * 100).toStringAsFixed(0)}%',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                  Text(
                    'Maks. $maxCapacityWatts W',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: Colors.white.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: loadRatio,
                  minHeight: 6,
                  backgroundColor: Colors.white.withValues(alpha: 0.15),
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.sageMint),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDonezoRelayCard({
    required String id,
    required String code,
    required String name,
    required int powerWatts,
    required bool isOn,
    required IconData icon,
    required VoidCallback onToggle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isOn ? AppTheme.pinePrimary.withValues(alpha: 0.35) : AppTheme.borderLight,
          width: isOn ? 1.5 : 1.0,
        ),
        boxShadow: AppTheme.softShadow,
      ),
      child: Row(
        children: [
          // Icon & Code Box
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isOn ? AppTheme.mintWash : AppTheme.canvas,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isOn ? AppTheme.sageMint.withValues(alpha: 0.3) : AppTheme.borderLight,
              ),
            ),
            child: Center(
              child: Icon(
                icon,
                color: isOn ? AppTheme.pinePrimary : AppTheme.textSecondary,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 14),

          // Name and Wattage
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
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
                  ],
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: AppTheme.canvas,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: Text(
                        code,
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${powerWatts}W • Catu 12V',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Tactile Donezo Sliding Switch
          GestureDetector(
            onTap: onToggle,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              width: 50,
              height: 28,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                color: isOn ? AppTheme.pinePrimary : AppTheme.borderMedium,
              ),
              child: AnimatedAlign(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                alignment: isOn ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  width: 22,
                  height: 22,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
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
  }

  Widget _buildScheduleTimetable() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.schedule_rounded, color: AppTheme.pinePrimary, size: 16),
              SizedBox(width: 8),
              Text(
                'JADWAL OTOMASI PERANGKAT',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  letterSpacing: 1.0,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildScheduleRow('Feeder Ikan Otomatis', '07:00 & 16:30 WIB', 'Porsi 35g', AppTheme.mintText, AppTheme.mintWash),
          const Divider(height: 18, color: AppTheme.borderLight),
          _buildScheduleRow('LED Grow Light Spektrum', '18:00 - 06:00 WIB', '12 Jam PPFD', AppTheme.bioAmber, Color(0xFFFEF3C7)),
          const Divider(height: 18, color: AppTheme.borderLight),
          _buildScheduleRow('Pompa Sirkulasi Kaskade', '24 Jam Non-Stop', 'Closed-Loop', AppTheme.aquaticCyan, Color(0xFFE0F2FE)),
        ],
      ),
    );
  }

  Widget _buildScheduleRow(String title, String time, String note, Color textColor, Color bgColor) {
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
            const SizedBox(height: 2),
            Text(
              time,
              style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            note,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              color: textColor,
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
            backgroundColor: AppTheme.pinePrimary,
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

  IconData _getActuatorIcon(String id) {
    switch (id) {
      case 'waterPump':
        return Icons.water_drop_rounded;
      case 'aerator':
        return Icons.air_rounded;
      case 'growLight':
        return Icons.wb_sunny_rounded;
      case 'feeder':
        return Icons.fastfood_rounded;
      default:
        return Icons.power_rounded;
    }
  }
}
