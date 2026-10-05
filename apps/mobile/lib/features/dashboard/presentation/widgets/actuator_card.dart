import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/models/telemetry_model.dart';

class ActuatorCard extends StatelessWidget {
  final ActuatorItem actuator;
  final ValueChanged<bool> onToggle;

  const ActuatorCard({
    super.key,
    required this.actuator,
    required this.onToggle,
  });

  IconData _getIcon() {
    switch (actuator.type) {
      case 'pump':
        return Icons.water;
      case 'aerator':
        return Icons.air;
      case 'light':
        return Icons.wb_sunny;
      case 'feeder':
      default:
        return Icons.bolt;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOn = actuator.isOn;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isOn ? AppTheme.accentYellow : AppTheme.borderLight,
          width: isOn ? 1.5 : 1.0,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x04000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  color: isOn
                      ? AppTheme.accentYellow.withValues(alpha: 0.22)
                      : AppTheme.canvas,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  _getIcon(),
                  color: isOn ? const Color(0xFF854D0E) : AppTheme.textMuted,
                  size: 22,
                ),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    actuator.name,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        '${actuator.powerWatts} Watt',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textMuted,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isOn ? '• AKTIF' : '• STANDBY',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isOn ? const Color(0xFFB45309) : AppTheme.textMuted,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          // Custom styled tactile switch
          Transform.scale(
            scale: 0.85,
            child: Switch(
              value: isOn,
              onChanged: onToggle,
              activeThumbColor: AppTheme.charcoal,
              activeTrackColor: AppTheme.accentYellow,
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: AppTheme.borderMedium,
            ),
          ),
        ],
      ),
    );
  }
}
