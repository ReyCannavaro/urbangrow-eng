import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/telemetry/presentation/telemetry_notifier.dart';
import 'package:mobile/features/alerts/presentation/widgets/alerts_modal_sheet.dart';

class TowerScreen extends ConsumerWidget {
  const TowerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: RefreshIndicator(
        onRefresh: () async => notifier.fetchLatest(),
        color: AppTheme.charcoal,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Vital Signs HUD (4 Large Confident Numbers)
              _buildVitalityHUD(telemetry),

              const SizedBox(height: 24),

              // 2. Section Header: The Cascade Tower
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'MENARA KASKADE 4-LEVEL',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 1.2,
                      color: AppTheme.textMuted,
                    ),
                  ),
                  Text(
                    telemetry.actuators['waterPump']?.isOn == true
                        ? 'RESIRKULASI AKTIF'
                        : 'SIRKULASI TERHENTI',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: telemetry.actuators['waterPump']?.isOn == true
                          ? AppTheme.leafGreen
                          : AppTheme.alertCoral,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 3. The 4 Interactive Cascade Tiers
              _buildTierCard(
                context,
                levelNumber: '4',
                name: 'PAKCOY CANOPY',
                spec: 'Hidroponik NFT • 120 Netpot',
                accentColor: AppTheme.leafGreen,
                icon: Icons.eco_rounded,
                primaryStat: 'H-10',
                statLabel: 'Est. Panen',
                statusText: 'Daun Segar • Penyerapan Nitrat Optimal',
                details: 'Nutrient Film Technique (NFT). Menyerap nitrat hasil biofilter sebagai nutrisi alami daun tanpa pupuk sintetis.',
              ),

              _buildFlowConduit(label: 'Tetesan Nutrisi Air Kolam (1.8 L/min)'),

              _buildTierCard(
                context,
                levelNumber: '3',
                name: 'KOLAM NILA MERAH',
                spec: 'Biofloc Tank • 85 Ekor (~14.2 kg)',
                accentColor: AppTheme.aquaticCyan,
                icon: Icons.set_meal_rounded,
                primaryStat: telemetry.sensors.dissolvedOxygen.toStringAsFixed(1),
                statLabel: 'mg/L DO',
                statusText: telemetry.sensors.dissolvedOxygen >= 5.0
                    ? 'Kondisi Prima • Nafsu Makan Aktif'
                    : 'Waspada Hipoksia',
                details: 'Ikan Nila aktif mengonsumsi pakan terapung dan menghasilkan amonia alami sebagai bahan baku pupuk bagi kangkung & pakcoy.',
              ),

              _buildFlowConduit(label: 'Air Bio-Overflow ke Substrat'),

              _buildTierCard(
                context,
                levelNumber: '2',
                name: 'KANGKUNG BIOFILTER',
                spec: 'Ebb & Flow • Substrat Hydroton',
                accentColor: AppTheme.bioAmber,
                icon: Icons.grass_rounded,
                primaryStat: '96.4%',
                statLabel: 'Konversi',
                statusText: 'Koloni Nitrosomonas & Nitrobacter Aktif',
                details: 'Pori-pori media hydroton menjadi habitat jutaan bakteri pengurai yang memecah amonia berbahaya menjadi nitrat bermanfaat.',
              ),

              _buildFlowConduit(label: 'Air Jernih Teralirkan ke Sump'),

              _buildTierCard(
                context,
                levelNumber: '1',
                name: 'SUMP PUMP & LELE',
                spec: 'Filter Padatan • 120 Ekor Lele',
                accentColor: AppTheme.sumpSlate,
                icon: Icons.water_rounded,
                primaryStat: '${telemetry.sensors.waterLevel.toStringAsFixed(0)}%',
                statLabel: 'Tangki Sump',
                statusText: telemetry.actuators['waterPump']?.isOn == true
                    ? 'Pompa Mendorong Air Kembali ke L4'
                    : 'Pompa Mati (Standby)',
                details: 'Tangki paling dasar untuk mengendapkan kotoran padat. Pompa submersible 12V 45W mengangkat air bersih kembali ke Level 4.',
              ),

              const SizedBox(height: 24),

              // 4. Heavy Tactile Action Trigger (Dispense Feed)
              _buildFeedTrigger(telemetry, notifier, context),

              const SizedBox(height: 90),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVitalityHUD(dynamic telemetry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'STATUS VITAL AIR SAAT INI',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  letterSpacing: 1.0,
                  color: AppTheme.textMuted,
                ),
              ),
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: telemetry.sensors.ph >= 6.5 && telemetry.sensors.ph <= 7.5
                          ? AppTheme.leafGreen
                          : AppTheme.alertCoral,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    telemetry.sensors.ph >= 6.5 && telemetry.sensors.ph <= 7.5
                        ? 'OPTIMAL'
                        : 'PERIKSA BUFFER',
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: telemetry.sensors.ph >= 6.5 && telemetry.sensors.ph <= 7.5
                          ? AppTheme.leafGreen
                          : AppTheme.alertCoral,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          // 4 Bold Numbers in 1 Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildHUDItem(
                value: telemetry.sensors.ph.toStringAsFixed(2),
                unit: 'pH',
                label: 'Keasaman',
                accentColor: AppTheme.leafGreen,
              ),
              _buildHUDDivider(),
              _buildHUDItem(
                value: telemetry.sensors.waterTemperature.toStringAsFixed(1),
                unit: '°C',
                label: 'Suhu Air',
                accentColor: AppTheme.aquaticCyan,
              ),
              _buildHUDDivider(),
              _buildHUDItem(
                value: telemetry.sensors.dissolvedOxygen.toStringAsFixed(2),
                unit: 'mg/L',
                label: 'Oksigen DO',
                accentColor: const Color(0xFF6366F1),
              ),
              _buildHUDDivider(),
              _buildHUDItem(
                value: telemetry.sensors.tds.toString(),
                unit: 'ppm',
                label: 'Nutrisi TDS',
                accentColor: AppTheme.bioAmber,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHUDItem({
    required String value,
    required String unit,
    required String label,
    required Color accentColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 21,
                fontWeight: FontWeight.w900,
                fontFamily: 'monospace',
                letterSpacing: -0.6,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(width: 2),
            Text(
              unit,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: accentColor,
              ),
            ),
          ],
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 9.5,
            color: AppTheme.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildHUDDivider() {
    return Container(
      width: 1,
      height: 28,
      color: AppTheme.borderLight,
    );
  }

  Widget _buildTierCard(
    BuildContext context, {
    required String levelNumber,
    required String name,
    required String spec,
    required Color accentColor,
    required IconData icon,
    required String primaryStat,
    required String statLabel,
    required String statusText,
    required String details,
  }) {
    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        _showTierDetailModal(context, levelNumber, name, spec, accentColor, icon, details);
      },
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.borderLight),
          boxShadow: AppTheme.softShadow,
        ),
        child: Row(
          children: [
            // Level Badge
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  'L$levelNumber',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'monospace',
                    color: accentColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),

            // Tier Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    spec,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    statusText,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: accentColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Primary Stat Pillar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.canvas,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    primaryStat,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                      color: AppTheme.charcoal,
                    ),
                  ),
                  Text(
                    statLabel,
                    style: const TextStyle(
                      fontSize: 8.5,
                      color: AppTheme.textMuted,
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

  Widget _buildFlowConduit({required String label}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 30),
      child: Row(
        children: [
          Container(
            width: 2,
            height: 16,
            color: AppTheme.aquaticCyan.withValues(alpha: 0.4),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_downward_rounded, size: 12, color: AppTheme.aquaticCyan),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 9.5,
              fontFamily: 'monospace',
              color: AppTheme.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeedTrigger(dynamic telemetry, dynamic notifier, BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: AppTheme.floatingPillShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'KONTROL DISPENSER PAKAN IKAN',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  letterSpacing: 1.0,
                  color: AppTheme.textLight,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.leafGreen.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  '35g PORSI TERUKUR',
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
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: telemetry.isFeedDispensing
                      ? null
                      : () {
                          HapticFeedback.heavyImpact();
                          notifier.dispenseFeed();
                        },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.leafGreen,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: telemetry.isFeedDispensing
                          ? const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                ),
                                SizedBox(width: 10),
                                Text(
                                  'Memutar Servo Feeder...',
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            )
                          : const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.fastfood_rounded, color: Colors.white, size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'Beri Pakan Sekarang',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Diagnostic sheet trigger
              InkWell(
                onTap: () {
                  HapticFeedback.lightImpact();
                  AlertsModalSheet.show(
                    context,
                    activeAnomaly: telemetry.anomalyMode,
                    onSelectAnomaly: notifier.setAnomaly,
                    isBackendLive: telemetry.isLive,
                  );
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.charcoalSoft,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.charcoalMuted),
                  ),
                  child: const Icon(
                    Icons.tune_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showTierDetailModal(
    BuildContext context,
    String level,
    String name,
    String spec,
    Color color,
    IconData icon,
    String details,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: AppTheme.floatingPillShadow,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.borderMedium,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'LEVEL $level • $name',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.2,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        spec,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              details,
              style: const TextStyle(
                fontSize: 12.5,
                color: AppTheme.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.charcoal,
                  side: const BorderSide(color: AppTheme.borderMedium),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
