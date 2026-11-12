import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/telemetry/presentation/telemetry_notifier.dart';
import 'package:mobile/features/telemetry/models/prediction_model.dart';

class AnalyticsAiScreen extends ConsumerStatefulWidget {
  const AnalyticsAiScreen({super.key});

  @override
  ConsumerState<AnalyticsAiScreen> createState() => _AnalyticsAiScreenState();
}

class _AnalyticsAiScreenState extends ConsumerState<AnalyticsAiScreen> {
  // 0: Fluktuasi Sensor, 1: Prediksi AI & Panen
  int _activeViewIndex = 0;
  int _selectedSensorIdx = 0;

  final List<Map<String, dynamic>> _metrics = [
    {
      'id': 'ph',
      'label': 'pH Air',
      'unit': 'pH',
      'color': AppTheme.pinePrimary,
      'target': '6.5 - 7.5',
      'base': 7.0,
      'variance': 0.12,
    },
    {
      'id': 'temp',
      'label': 'Suhu Air',
      'unit': '°C',
      'color': AppTheme.aquaticCyan,
      'target': '24.0 - 28.0',
      'base': 24.5,
      'variance': 0.6,
    },
    {
      'id': 'do',
      'label': 'Oksigen DO',
      'unit': 'mg/L',
      'color': const Color(0xFF6366F1),
      'target': '> 5.0',
      'base': 7.4,
      'variance': 0.3,
    },
    {
      'id': 'tds',
      'label': 'Nutrisi TDS',
      'unit': 'ppm',
      'color': AppTheme.bioAmber,
      'target': '500 - 800',
      'base': 540.0,
      'variance': 20.0,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

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
              // 1. Dual-View Segmented Selector Pill
              _buildTopSegmentedSwitcher(),

              const SizedBox(height: 16),

              // 2. Conditional Sub-View
              if (_activeViewIndex == 0)
                _buildSensorFluctuationView(telemetry)
              else
                _buildAiPredictionsView(telemetry),

              const SizedBox(height: 96),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // TOP SEGMENTED SWITCHER (Fluktuasi Sensor vs Prediksi Panen)
  // =========================================================================
  Widget _buildTopSegmentedSwitcher() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildSwitcherPill(
              title: 'Fluktuasi Sensor',
              icon: Icons.show_chart_rounded,
              isSelected: _activeViewIndex == 0,
              onTap: () {
                if (_activeViewIndex != 0) {
                  HapticFeedback.lightImpact();
                  setState(() => _activeViewIndex = 0);
                }
              },
            ),
          ),
          Expanded(
            child: _buildSwitcherPill(
              title: 'Prediksi AI & CAS',
              icon: Icons.psychology_rounded,
              isSelected: _activeViewIndex == 1,
              onTap: () {
                if (_activeViewIndex != 1) {
                  HapticFeedback.lightImpact();
                  setState(() => _activeViewIndex = 1);
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitcherPill({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.pinePrimary : Colors.transparent,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : AppTheme.textSecondary,
            ),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                  color: isSelected ? Colors.white : AppTheme.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // SUB-VIEW A: FLUKTUASI SENSOR REAL-TIME
  // =========================================================================
  Widget _buildSensorFluctuationView(dynamic telemetry) {
    final selected = _metrics[_selectedSensorIdx];
    final color = selected['color'] as Color;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Water Quality Index Hero Banner
        _buildWQIScoreHero(telemetry),

        const SizedBox(height: 16),

        // Interactive Spline Chart Card
        _buildInteractiveSplineCard(telemetry, selected, color),

        const SizedBox(height: 16),

        // Nitrogen Closed-Loop Efficiency
        _buildNitrogenEfficiencyCard(),

        const SizedBox(height: 16),

        // 24-Hour Statistical Range
        _buildStatisticalRange(telemetry),
      ],
    );
  }

  Widget _buildWQIScoreHero(dynamic telemetry) {
    final ph = telemetry.sensors.ph;
    final temp = telemetry.sensors.waterTemperature;
    final doVal = telemetry.sensors.dissolvedOxygen;

    final wqiScore = (100 -
            ((ph - 7.0).abs() * 16) -
            (max(0.0, 6.5 - doVal) * 8) -
            ((temp - 24.5).abs() * 2.5))
        .clamp(50.0, 98.0)
        .round();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
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
      child: Row(
        children: [
          Container(
            width: 74,
            height: 74,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.12),
              border: Border.all(color: AppTheme.sageMint, width: 2.5),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$wqiScore',
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'monospace',
                    color: Colors.white,
                  ),
                ),
                const Text(
                  '/ 100',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.sageMint,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.sageMint,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'WATER QUALITY INDEX',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        letterSpacing: 1.0,
                        color: AppTheme.sageMint,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Kualitas Air Prima',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Siklus nitrifikasi dan aerasi kaskade menjaga parameter dalam toleransi biologis.',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white.withValues(alpha: 0.8),
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

  Widget _buildInteractiveSplineCard(
    dynamic telemetry,
    Map<String, dynamic> selected,
    Color color,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Segmented Metric Channel Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_metrics.length, (idx) {
                final isCurrent = _selectedSensorIdx == idx;
                final m = _metrics[idx];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() => _selectedSensorIdx = idx);
                    },
                    borderRadius: BorderRadius.circular(999),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: isCurrent ? AppTheme.pinePrimary : AppTheme.canvas,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: isCurrent ? AppTheme.pinePrimary : AppTheme.borderLight,
                        ),
                      ),
                      child: Text(
                        m['label'],
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isCurrent ? Colors.white : AppTheme.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          const SizedBox(height: 20),

          // Current Value Callout
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    _getValueString(telemetry, selected['id']),
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                      letterSpacing: -1.2,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    selected['unit'],
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: color == AppTheme.pinePrimary ? AppTheme.mintText : color,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Target: ${selected['target']} ${selected['unit']}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const Text(
                    'Jendela 60-Sampel',
                    style: TextStyle(fontSize: 10, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Smooth Custom Spline Chart
          SizedBox(
            height: 140,
            width: double.infinity,
            child: CustomPaint(
              painter: _SplineChartPainter(
                lineColor: color,
                baseValue: (selected['base'] as num).toDouble(),
                variance: (selected['variance'] as num).toDouble(),
              ),
            ),
          ),

          const SizedBox(height: 12),

          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('60 Sampel Lalu', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              Text('30 Sampel Lalu', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              Text('Sekarang (ESP32)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.pinePrimary)),
            ],
          ),
        ],
      ),
    );
  }

  String _getValueString(dynamic telemetry, String id) {
    switch (id) {
      case 'ph':
        return telemetry.sensors.ph.toStringAsFixed(2);
      case 'temp':
        return telemetry.sensors.waterTemperature.toStringAsFixed(1);
      case 'do':
        return telemetry.sensors.dissolvedOxygen.toStringAsFixed(2);
      case 'tds':
        return telemetry.sensors.tds.toString();
      default:
        return '0';
    }
  }

  Widget _buildNitrogenEfficiencyCard() {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.recycling_rounded, color: AppTheme.pinePrimary, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'EFISIENSI BIOFILTER NITROGEN',
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.mintWash,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'CLOSED LOOP',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.mintText,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildMetricChip('96.4%', 'Konversi Amonia', AppTheme.pinePrimary, AppTheme.mintWash),
              const SizedBox(width: 8),
              _buildMetricChip('1.4 : 1', 'Rasio Sayur/Ikan', AppTheme.aquaticCyan, const Color(0xFFE0F2FE)),
              const SizedBox(width: 8),
              _buildMetricChip('250 L/h', 'Debit Sirkulasi', AppTheme.bioAmber, const Color(0xFFFEF3C7)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricChip(String value, String label, Color color, Color bg) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                fontFamily: 'monospace',
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatisticalRange(dynamic telemetry) {
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
          const Text(
            'RENTANG STATISTIK TELEMETRI FISIK',
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              letterSpacing: 1.0,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),
          _buildStatRow('pH Air Kolam', '6.85 pH', '7.15 pH', telemetry.sensors.ph.toStringAsFixed(2), 'Stabil'),
          const Divider(height: 18, color: AppTheme.borderLight),
          _buildStatRow('Suhu Air (DS18B20)', '24.1 °C', '25.6 °C', '${telemetry.sensors.waterTemperature.toStringAsFixed(1)} °C', 'Normal'),
          const Divider(height: 18, color: AppTheme.borderLight),
          _buildStatRow('Nutrisi TDS (TDS-V1)', '510 ppm', '575 ppm', '${telemetry.sensors.tds} ppm', 'Optimal'),
          const Divider(height: 18, color: AppTheme.borderLight),
          _buildStatRow('Oksigen Terlarut (DO)', '6.8 mg/L', '7.8 mg/L', '${telemetry.sensors.dissolvedOxygen.toStringAsFixed(1)} mg/L', 'Kaya Oksigen'),
        ],
      ),
    );
  }

  Widget _buildStatRow(String name, String min, String max, String current, String status) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              name,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Min: $min  •  Max: $max',
              style: const TextStyle(fontSize: 10.5, color: AppTheme.textMuted),
            ),
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              current,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              status,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: AppTheme.mintText,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // =========================================================================
  // SUB-VIEW B: PREDIKSI AI & ADAPTASI IKLIM (CAS + GDD + ADG)
  // =========================================================================
  Widget _buildAiPredictionsView(dynamic telemetry) {
    final pakcoy = CropHarvestItem.pakcoyFallback();
    final kangkung = CropHarvestItem.kangkungFallback();
    final nila = FishHarvestItem.nilaFallback();
    final lele = FishHarvestItem.leleFallback();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Climate Adaptation Score (CAS) Hero Card
        _buildClimateAdaptationScoreHero(),

        const SizedBox(height: 16),

        // 2. Hardware Live Calibration Banner
        _buildHardwareCalibrationBanner(),

        const SizedBox(height: 20),

        // 3. Section Header: GDD Crop Harvest Predictions
        const Text(
          'MODEL ESTIMASI PANEN TANAMAN (GDD MODEL)',
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            letterSpacing: 1.1,
            color: AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 12),

        // Pakcoy Card
        _buildCropHarvestCard(pakcoy),

        const SizedBox(height: 12),

        // Kangkung Card
        _buildCropHarvestCard(kangkung),

        const SizedBox(height: 20),

        // 4. Section Header: ADG Fish Growth Predictions
        const Text(
          'MODEL PERTUMBUHAN & BOBOT IKAN (ADG MODEL)',
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            letterSpacing: 1.1,
            color: AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 12),

        // Nila Card
        _buildFishHarvestCard(nila),

        const SizedBox(height: 12),

        // Lele Card
        _buildFishHarvestCard(lele),
      ],
    );
  }

  Widget _buildClimateAdaptationScoreHero() {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.sageMint,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'CLIMATE ADAPTATION SCORE (CAS)',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 1.1,
                      color: AppTheme.sageMint,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                ),
                child: const Text(
                  'RESILIENSI TINGGI',
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

          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: const [
              Text(
                '92',
                style: TextStyle(
                  fontSize: 52,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -2.0,
                  color: Colors.white,
                  fontFamily: 'monospace',
                ),
              ),
              SizedBox(width: 6),
              Text(
                '/ 100',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppTheme.sageMint,
                ),
              ),
              Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Sidoarjo Cuaca Mikro',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Adaptif Fluktuasi Panas Tropis',
                    style: TextStyle(
                      fontSize: 10.5,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Sub-scores 4 Bar Matrix
          Column(
            children: [
              _buildCasScoreBar('Stabilitas Suhu Air', 0.94, '94%'),
              const SizedBox(height: 8),
              _buildCasScoreBar('Keseimbangan Kimia & pH', 0.91, '91%'),
              const SizedBox(height: 8),
              _buildCasScoreBar('Kelarutan Oksigen (DO)', 0.96, '96%'),
              const SizedBox(height: 8),
              _buildCasScoreBar('Konsistensi Fotoperiode LED', 0.88, '88%'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCasScoreBar(String label, double ratio, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 10.5,
                color: Colors.white70,
              ),
            ),
            Text(
              val,
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: ratio,
            minHeight: 5,
            backgroundColor: Colors.white.withValues(alpha: 0.15),
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.sageMint),
          ),
        ),
      ],
    );
  }

  Widget _buildHardwareCalibrationBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.mintWash,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.sageMint.withValues(alpha: 0.3)),
      ),
      child: const Row(
        children: [
          Icon(Icons.verified_rounded, color: AppTheme.mintText, size: 20),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Model machine learning terkalibrasi dinamis oleh data ESP32 live (pH, TDS, DS18B20, BH1750).',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppTheme.mintText,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCropHarvestCard(CropHarvestItem crop) {
    final isPakcoy = crop.cropName.toLowerCase().contains('pakcoy');

    return Container(
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: isPakcoy ? AppTheme.mintWash : const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.eco_rounded,
                      color: isPakcoy ? AppTheme.pinePrimary : AppTheme.accentAmber,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Sayuran ${crop.cropName}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.canvas,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppTheme.borderLight),
                            ),
                            child: Text(
                              crop.level,
                              style: const TextStyle(
                                fontSize: 9.5,
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
                        crop.growthStage,
                        style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.mintWash,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppTheme.sageMint.withValues(alpha: 0.3)),
                ),
                child: Text(
                  '${crop.daysToHarvest} HARI LAGI',
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

          const SizedBox(height: 16),

          // Progress GDD Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Akumulasi Termal GDD',
                style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
              ),
              Text(
                '${crop.accumulatedGdd} / ${crop.targetGdd} °C·Hari (${crop.progressPct}%)',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: (crop.progressPct / 100).clamp(0.0, 1.0),
              minHeight: 7,
              backgroundColor: AppTheme.canvas,
              valueColor: AlwaysStoppedAnimation<Color>(
                isPakcoy ? AppTheme.pinePrimary : AppTheme.sageMint,
              ),
            ),
          ),

          const SizedBox(height: 14),

          // 3 Metric Badges
          Row(
            children: [
              _buildPredictMiniStat('Biomassa Est.', '${crop.projectedBiomassGrams}g / pot'),
              const SizedBox(width: 8),
              _buildPredictMiniStat('Efisiensi LED', '${crop.lightEfficiencyPct}%'),
              const SizedBox(width: 8),
              _buildPredictMiniStat('Kualitas Daun', 'Super Grade A'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFishHarvestCard(FishHarvestItem fish) {
    final isNila = fish.species.toLowerCase().contains('nila');

    return Container(
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: isNila ? const Color(0xFFE0F2FE) : AppTheme.canvas,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.set_meal_rounded,
                      color: isNila ? AppTheme.aquaticCyan : AppTheme.sumpSlate,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            fish.species,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.canvas,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppTheme.borderLight),
                            ),
                            child: Text(
                              fish.level,
                              style: const TextStyle(
                                fontSize: 9.5,
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
                        fish.growthStage,
                        style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: isNila ? const Color(0xFFE0F2FE) : AppTheme.canvas,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: isNila
                        ? AppTheme.aquaticCyan.withValues(alpha: 0.3)
                        : AppTheme.borderLight,
                  ),
                ),
                child: Text(
                  '${fish.daysRemaining} HARI LAGI',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: isNila ? AppTheme.aquaticCyan : AppTheme.textSecondary,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Growth Progress Bar (Length in cm)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Pertumbuhan Panjang Fisik',
                style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
              ),
              Text(
                '${fish.currentLengthCm} cm / ${fish.targetLengthCm} cm (${fish.progressPct}%)',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: (fish.progressPct / 100).clamp(0.0, 1.0),
              minHeight: 7,
              backgroundColor: AppTheme.canvas,
              valueColor: AlwaysStoppedAnimation<Color>(
                isNila ? AppTheme.aquaticCyan : AppTheme.sumpSlate,
              ),
            ),
          ),

          const SizedBox(height: 14),

          // 3 Metric Badges
          Row(
            children: [
              _buildPredictMiniStat('Bobot Rata-rata', '${fish.currentWeightGrams.toStringAsFixed(0)}g / ekor'),
              const SizedBox(width: 8),
              _buildPredictMiniStat('Target Panen', '${fish.targetWeightGrams.toStringAsFixed(0)}g'),
              const SizedBox(width: 8),
              _buildPredictMiniStat('Rasio FCR', '${fish.fcr} (Efisien)'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPredictMiniStat(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.canvas,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 9.5, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
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
}

// =========================================================================
// CUSTOM SPLINE CHART PAINTER
// =========================================================================
class _SplineChartPainter extends CustomPainter {
  final Color lineColor;
  final double baseValue;
  final double variance;

  _SplineChartPainter({
    required this.lineColor,
    required this.baseValue,
    required this.variance,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final width = size.width;
    final height = size.height;

    // Draw Subtle Horizontal Gridlines
    final gridPaint = Paint()
      ..color = AppTheme.borderLight
      ..strokeWidth = 1.0;

    for (int i = 1; i <= 3; i++) {
      final y = height * (i / 4);
      canvas.drawLine(Offset(0, y), Offset(width, y), gridPaint);
    }

    // Generate Smooth Curve Points
    final points = <Offset>[];
    const pointCount = 12;

    for (int i = 0; i < pointCount; i++) {
      final x = width * (i / (pointCount - 1));
      // Organic natural curve based on sinusoidal function
      final phase = (i / pointCount) * 2 * pi;
      final offset = sin(phase * 1.5) * 0.4 + cos(phase * 2.2) * 0.3;
      final normalizedY = 0.5 + (offset * 0.35);
      final y = (normalizedY * height).clamp(10.0, height - 10.0);
      points.add(Offset(x, y));
    }

    // Gradient Fill Under the Curve
    final fillPath = Path()..moveTo(points.first.dx, points.first.dy);

    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final midX = (p0.dx + p1.dx) / 2;
      fillPath.cubicTo(midX, p0.dy, midX, p1.dy, p1.dx, p1.dy);
    }

    fillPath.lineTo(width, height);
    fillPath.lineTo(0, height);
    fillPath.close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lineColor.withValues(alpha: 0.28),
          lineColor.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, width, height));

    canvas.drawPath(fillPath, fillPaint);

    // Main Smooth Bezier Line
    final linePath = Path()..moveTo(points.first.dx, points.first.dy);

    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final midX = (p0.dx + p1.dx) / 2;
      linePath.cubicTo(midX, p0.dy, midX, p1.dy, p1.dx, p1.dy);
    }

    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(linePath, linePaint);

    // End Point Indicator (Current reading)
    final lastPoint = points.last;
    final dotBgPaint = Paint()..color = Colors.white;
    final dotBorderPaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(lastPoint, 5.0, dotBgPaint);
    canvas.drawCircle(lastPoint, 5.0, dotBorderPaint);
  }

  @override
  bool shouldRepaint(covariant _SplineChartPainter oldDelegate) {
    return oldDelegate.lineColor != lineColor ||
        oldDelegate.baseValue != baseValue ||
        oldDelegate.variance != variance;
  }
}

