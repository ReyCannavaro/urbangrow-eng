import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';

class EcosystemScreen extends ConsumerWidget {
  const EcosystemScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(telemetryNotifierProvider);

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Title Header
            _buildPageHeader(),

            const SizedBox(height: 16),

            // Closed-Loop Nitrogen Flow Banner
            _buildNitrogenCycleCard(),

            const SizedBox(height: 20),

            // Section Label
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'ARSITEKTUR KASKADE 4-LEVEL',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    letterSpacing: 1.0,
                    color: AppTheme.textMuted,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentEmerald.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: AppTheme.accentEmerald.withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Text(
                    'ZERO CHEMICAL',
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: AppTheme.accentEmeraldDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Level 4: Pakcoy
            _buildLevelCard(
              level: 'LEVEL 4',
              title: 'Pakcoy Hidroponik (NFT & Drip)',
              subtitle: '120 Netpot • Usia H+18 • Est. Panen 10 Hari Lagi',
              badgeText: 'Substrat Nitrat',
              accentColor: AppTheme.accentEmerald,
              metrics: [
                _buildMiniParam('Target pH', '6.0 - 6.8', telemetry.sensors.ph.toStringAsFixed(2)),
                _buildMiniParam('TDS Nutrisi', '500-750 ppm', '${telemetry.sensors.tds} ppm'),
                _buildMiniParam('Debit Alir', '1.8 L/min', 'Optimal'),
              ],
              description:
                  'Menggunakan Nutrient Film Technique (NFT). Menyerap nitrat hasil dekomposisi biofilter sebagai pupuk utama daun tanpa pupuk kimia sintetis.',
              icon: Icons.eco_rounded,
            ),

            const SizedBox(height: 12),

            // Level 3: Nila
            _buildLevelCard(
              level: 'LEVEL 3',
              title: 'Kolam Budidaya Ikan Nila',
              subtitle: '85 Ekor • Total Biomassa 14.2 kg • FCR 1.15',
              badgeText: 'Biofloc Active',
              accentColor: AppTheme.accentCyan,
              metrics: [
                _buildMiniParam('DO Terlarut', '> 5.0 mg/L', '${telemetry.sensors.dissolvedOxygen.toStringAsFixed(2)} mg/L'),
                _buildMiniParam('Suhu Air', '24 - 28°C', '${telemetry.sensors.waterTemperature.toStringAsFixed(1)}°C'),
                _buildMiniParam('Nafsu Makan', 'Tinggi', 'Aktif'),
              ],
              description:
                  'Ikan Nila merah toleran terhadap fluktuasi air dengan kepadatan sedang. Pakan terapung otomatis terjadwal menyuplai sumber amonia alami untuk tanaman.',
              icon: Icons.set_meal_rounded,
            ),

            const SizedBox(height: 12),

            // Level 2: Kangkung Ebb & Flow
            _buildLevelCard(
              level: 'LEVEL 2',
              title: 'Kangkung Darat Biofilter',
              subtitle: '96 Lubang Tanam • Substrat Hydroton & Pasang-Surut',
              badgeText: 'Nitrifying Zone',
              accentColor: AppTheme.accentYellowDeep,
              metrics: [
                _buildMiniParam('Siklus Pasang', '15 Menit', 'Normal'),
                _buildMiniParam('Bakteri', 'Nitrosomonas', 'Optimal'),
                _buildMiniParam('Serapan Amonia', '94.2%', 'Efisien'),
              ],
              description:
                  'Berfungsi ganda sebagai produsen sayuran dan filter biologis. Koloni mikroba di pori hydroton mengubah amonia beracun menjadi nitrat ramah tanaman.',
              icon: Icons.grass_rounded,
            ),

            const SizedBox(height: 12),

            // Level 1: Lele Sump Tank
            _buildLevelCard(
              level: 'LEVEL 1',
              title: 'Kolam Lele & Sump Filter',
              subtitle: '120 Ekor Lele • Tangki Pengendapan & Pompa Resirkulasi',
              badgeText: 'Closed Loop Recirculation',
              accentColor: AppTheme.accentSlate,
              metrics: [
                _buildMiniParam('Tingkat Air', '80 - 100%', '${telemetry.sensors.waterLevel.toStringAsFixed(1)}%'),
                _buildMiniParam('Status Pompa', '12V 45W', telemetry.actuators['waterPump']?.isOn == true ? 'MENYALA' : 'STANDBY'),
                _buildMiniParam('Filter Fisik', 'Swirl Sump', 'Bersih'),
              ],
              description:
                  'Tangki paling dasar untuk menampung air yang telah tersaring dan endapan padat kotoran. Pompa sirkulasi mengangkat air jernih kembali ke Level 4.',
              icon: Icons.water_rounded,
            ),

            const SizedBox(height: 20),

            // Harvest & Maintenance Schedule
            _buildScheduleCard(),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildPageHeader() {
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
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.accentEmerald.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.layers_rounded,
                  color: AppTheme.accentEmeraldDark,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Sistem Ekosistem Bertingkat',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Cascade 4-Level Aquaponics • Zero Waste Symbiosis',
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
          const SizedBox(height: 16),
          // Progress level pills
          Row(
            children: [
              _buildProgressBadge('L4', 'Pakcoy', AppTheme.accentEmerald, '100%'),
              const SizedBox(width: 6),
              _buildProgressBadge('L3', 'Nila', AppTheme.accentCyan, '98%'),
              const SizedBox(width: 6),
              _buildProgressBadge('L2', 'Kangkung', AppTheme.accentYellowDeep, '95%'),
              const SizedBox(width: 6),
              _buildProgressBadge('L1', 'Lele', AppTheme.accentSlate, '100%'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBadge(String code, String name, Color color, String health) {
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
              code,
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
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              health,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNitrogenCycleCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(24),
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
                  Icon(Icons.recycling_rounded, color: AppTheme.accentYellow, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'SIKLUS NITROGEN CLOSED-LOOP',
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
                child: const Text(
                  'EFISIENSI 96.4%',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.accentYellow,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Flow steps
          Row(
            children: [
              _buildCycleStep('Pakan & Feses', 'Amonia (NH3)', Icons.bubble_chart_rounded, AppTheme.accentYellow),
              _buildFlowArrow(),
              _buildCycleStep('Biofilter L2', 'Nitrit -> Nitrat', Icons.science_rounded, AppTheme.accentCyan),
              _buildFlowArrow(),
              _buildCycleStep('Sayuran L4', 'Nutrisi Daun', Icons.eco_rounded, AppTheme.accentEmerald),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCycleStep(String step, String formula, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        decoration: BoxDecoration(
          color: AppTheme.charcoalSoft,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.charcoalMuted),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 6),
            Text(
              step,
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              formula,
              style: TextStyle(
                fontSize: 8.5,
                color: color,
                fontFamily: 'monospace',
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlowArrow() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 4),
      child: Icon(Icons.arrow_forward_rounded, color: AppTheme.textMuted, size: 14),
    );
  }

  Widget _buildLevelCard({
    required String level,
    required String title,
    required String subtitle,
    required String badgeText,
    required Color accentColor,
    required List<Widget> metrics,
    required String description,
    required IconData icon,
  }) {
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
          // Header row
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: accentColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          level,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: accentColor,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.canvas,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppTheme.borderLight),
                          ),
                          child: Text(
                            badgeText,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                    Text(
                      subtitle,
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

          // Mini metrics row
          Container(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            decoration: BoxDecoration(
              color: AppTheme.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: metrics,
            ),
          ),

          const SizedBox(height: 12),

          // Description paragraph
          Text(
            description,
            style: const TextStyle(
              fontSize: 11.5,
              color: AppTheme.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniParam(String label, String target, String current) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 9.5,
            color: AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          current,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            color: AppTheme.textPrimary,
          ),
        ),
        Text(
          'Target: $target',
          style: const TextStyle(
            fontSize: 8.5,
            color: AppTheme.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildScheduleCard() {
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
              Icon(Icons.calendar_month_rounded, color: AppTheme.charcoal, size: 18),
              SizedBox(width: 8),
              Text(
                'JADWAL PANEN & PEMELIHARAAN',
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
          const SizedBox(height: 14),
          _buildTimelineItem('10 Hari Lagi', 'Panen Raya Pakcoy Level 4', 'Estimasi 120 ikat sayuran segar siap distribusi', AppTheme.accentEmerald),
          const Divider(height: 20),
          _buildTimelineItem('22 Hari Lagi', 'Sampling Bobot Ikan Nila L3', 'Target bobot rata-rata 200 gram / ekor', AppTheme.accentCyan),
          const Divider(height: 20),
          _buildTimelineItem('3 Hari Lagi', 'Pembersihan Swirl Filter Level 1', 'Pengeringan lumpur padatan organik untuk kompos', AppTheme.accentYellowDeep),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String time, String title, String desc, Color dotColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 4),
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: dotColor,
          ),
        ),
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
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: dotColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
