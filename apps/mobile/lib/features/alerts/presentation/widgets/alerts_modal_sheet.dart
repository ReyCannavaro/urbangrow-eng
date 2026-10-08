import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_theme.dart';

class AlertsModalSheet extends StatelessWidget {
  final String activeAnomaly;
  final Function(String) onSelectAnomaly;
  final bool isBackendLive;

  const AlertsModalSheet({
    super.key,
    required this.activeAnomaly,
    required this.onSelectAnomaly,
    required this.isBackendLive,
  });

  static void show(
    BuildContext context, {
    required String activeAnomaly,
    required Function(String) onSelectAnomaly,
    required bool isBackendLive,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AlertsModalSheet(
        activeAnomaly: activeAnomaly,
        onSelectAnomaly: onSelectAnomaly,
        isBackendLive: isBackendLive,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.cardBg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: AppTheme.floatingPillShadow,
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.borderMedium,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Title & Live status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Pusat Notifikasi & Anomali',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Diagnostic Hub • Telemetry Anomaly Simulator',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isBackendLive
                      ? AppTheme.mintWash
                      : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: isBackendLive
                        ? AppTheme.sageMint.withValues(alpha: 0.3)
                        : const Color(0xFFFDE68A),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isBackendLive
                            ? AppTheme.mintText
                            : AppTheme.accentYellowDeep,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isBackendLive ? 'Tersinkron' : 'Mode Mandiri',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: isBackendLive
                            ? AppTheme.mintText
                            : AppTheme.accentYellowDeep,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Active system notifications list
          const Text(
            'STATUS MONITORING TERBARU',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              letterSpacing: 0.8,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 10),

          _buildAlertItem(
            icon: Icons.check_circle_rounded,
            color: AppTheme.accentEmerald,
            title: 'Kualitas Air Stabil',
            description:
                'Kadar pH dan Oksigen Terlarut (DO) berada dalam batas fisiologis optimal untuk Nila dan Pakcoy.',
            time: 'Aktif Sekarang',
          ),
          const SizedBox(height: 8),
          _buildAlertItem(
            icon: Icons.water_drop_rounded,
            color: AppTheme.accentCyan,
            title: 'Sirkulasi Pompa Berjalan',
            description:
                'Resirkulasi closed-loop dari kolam Lele (L1) ke Pakcoy (L4) mengalir normal dengan debit 4.2 L/min.',
            time: '15 mnt lalu',
          ),

          const SizedBox(height: 24),

          // Anomaly simulation tester
          const Text(
            'UJI SKENARIO STRES & ANOMALI BIOLOGIS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              letterSpacing: 0.8,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: _buildScenarioChip(
                  context,
                  id: 'none',
                  title: 'Normal',
                  subtitle: 'pH 7.0 • 24.5°C',
                  icon: '✨',
                  isActive: activeAnomaly == 'none',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildScenarioChip(
                  context,
                  id: 'ph_drop',
                  title: 'pH Drop',
                  subtitle: 'Asidosis pH 5.8',
                  icon: '⚠️',
                  isActive: activeAnomaly == 'ph_drop',
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildScenarioChip(
                  context,
                  id: 'heatwave',
                  title: 'Heatwave',
                  subtitle: 'Suhu 30.2°C',
                  icon: '☀️',
                  isActive: activeAnomaly == 'heatwave',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildScenarioChip(
                  context,
                  id: 'tds_spike',
                  title: 'TDS Spike',
                  subtitle: 'Garam 1120 ppm',
                  icon: '🧪',
                  isActive: activeAnomaly == 'tds_spike',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAlertItem({
    required IconData icon,
    required Color color,
    required String title,
    required String description,
    required String time,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderLight),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
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
                    Text(
                      time,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScenarioChip(
    BuildContext context, {
    required String id,
    required String title,
    required String subtitle,
    required String icon,
    required bool isActive,
  }) {
    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        onSelectAnomaly(id);
        Navigator.pop(context);
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.pinePrimary : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive ? AppTheme.pinePrimary : AppTheme.borderLight,
            width: isActive ? 1.5 : 1.0,
          ),
          boxShadow: AppTheme.cardShadow,
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 9.5,
                      color: isActive
                          ? Colors.white.withValues(alpha: 0.7)
                          : AppTheme.textSecondary,
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
}
