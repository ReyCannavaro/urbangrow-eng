import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/telemetry/presentation/telemetry_notifier.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  int _selectedIdx = 0;

  final List<Map<String, dynamic>> _metrics = [
    {
      'id': 'ph',
      'label': 'Kadar pH',
      'unit': 'pH',
      'color': AppTheme.leafGreen,
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
      'label': 'Oksigen (DO)',
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
    final selected = _metrics[_selectedIdx];
    final color = selected['color'] as Color;

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Water Quality Index (WQI) Score Banner
            _buildWQIScoreHeader(),

            const SizedBox(height: 24),

            // 2. Interactive Telemetry Trend Chart Card
            _buildInteractiveSplineCard(telemetry, selected, color),

            const SizedBox(height: 20),

            // 3. Nitrogen Closed-Loop Efficiency Indicator
            _buildNitrogenEfficiencyCard(),

            const SizedBox(height: 20),

            // 4. 24-Hour Statistical Range
            _buildStatisticalRange(telemetry),

            const SizedBox(height: 90),
          ],
        ),
      ),
    );
  }

  Widget _buildWQIScoreHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: AppTheme.floatingPillShadow,
      ),
      child: Row(
        children: [
          // Circular WQI Score Badge
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.charcoalSoft,
              border: Border.all(color: AppTheme.leafGreenLight, width: 2.5),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '94',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'monospace',
                    color: Colors.white,
                  ),
                ),
                Text(
                  '/ 100',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.leafGreenLight,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'WATER QUALITY INDEX',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    letterSpacing: 1.0,
                    color: AppTheme.leafGreenLight,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Kualitas Air Prima',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Siklus nitrifikasi dan aerasi menjaga parameter tetap dalam toleransi biologis.',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.textMuted,
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
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Segmented Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_metrics.length, (idx) {
                final isCurrent = _selectedIdx == idx;
                final m = _metrics[idx];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => setState(() => _selectedIdx = idx),
                    borderRadius: BorderRadius.circular(999),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: isCurrent ? AppTheme.charcoal : AppTheme.canvas,
                        borderRadius: BorderRadius.circular(999),
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
                      color: color,
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
                    '24 Jam Terakhir',
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
              Text('24 Jam Lalu', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              Text('12 Jam Lalu', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              Text('6 Jam Lalu', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              Text('Sekarang', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.charcoal)),
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
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppTheme.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
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
              Text(
                'CLOSED LOOP',
                style: TextStyle(
                  fontSize: 9.5,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: AppTheme.leafGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildMetricChip('96.4%', 'Konversi Amonia', AppTheme.leafGreen),
              const SizedBox(width: 8),
              _buildMetricChip('1.4 : 1', 'Rasio Sayur/Ikan', AppTheme.aquaticCyan),
              const SizedBox(width: 8),
              _buildMetricChip('250 L/h', 'Debit Sirkulasi', AppTheme.bioAmber),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricChip(String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderLight),
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
            'STATISTIK 24 JAM TERAKHIR',
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              letterSpacing: 1.0,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 12),
          _buildStatRow('Kadar pH', '6.88', '7.12', telemetry.sensors.ph.toStringAsFixed(2)),
          const Divider(height: 16),
          _buildStatRow('Suhu Air', '23.8°C', '25.4°C', '${telemetry.sensors.waterTemperature.toStringAsFixed(1)}°C'),
          const Divider(height: 16),
          _buildStatRow('Oksigen DO', '6.95 mg/L', '7.80 mg/L', '${telemetry.sensors.dissolvedOxygen.toStringAsFixed(2)} mg/L'),
          const Divider(height: 16),
          _buildStatRow('TDS Nutrisi', '525 ppm', '560 ppm', '${telemetry.sensors.tds} ppm'),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String min, String max, String current) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
        ),
        Text('Min: $min', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
        Text('Max: $max', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
        Text(
          'Kini: $current',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: AppTheme.charcoal),
        ),
      ],
    );
  }
}

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

    // Horizontal guideline
    final gridPaint = Paint()
      ..color = AppTheme.borderLight
      ..strokeWidth = 1.0;

    for (int i = 1; i <= 3; i++) {
      final y = (height / 4) * i;
      canvas.drawLine(Offset(0, y), Offset(width, y), gridPaint);
    }

    final points = <Offset>[];
    const count = 16;
    final random = Random(101);

    for (int i = 0; i < count; i++) {
      final x = (width / (count - 1)) * i;
      final wave = sin(i * 0.6) * 0.4 + (random.nextDouble() - 0.5) * 0.5;
      final normY = (0.5 + wave * 0.35).clamp(0.12, 0.88);
      points.add(Offset(x, height * normY));
    }

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final cx = (p0.dx + p1.dx) / 2;
      path.cubicTo(cx, p0.dy, cx, p1.dy, p1.dx, p1.dy);
    }

    // Gradient fill
    final fillPath = Path.from(path)
      ..lineTo(width, height)
      ..lineTo(0, height)
      ..close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lineColor.withValues(alpha: 0.22),
          lineColor.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, width, height));

    canvas.drawPath(fillPath, fillPaint);

    // Stroke
    final strokePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(path, strokePaint);

    // Current point dot
    final last = points.last;
    canvas.drawCircle(last, 6, Paint()..color = lineColor);
    canvas.drawCircle(last, 3, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(covariant _SplineChartPainter oldDelegate) {
    return oldDelegate.lineColor != lineColor;
  }
}
