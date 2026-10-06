import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  int _selectedMetricIndex = 0;

  final List<Map<String, dynamic>> _metrics = [
    {
      'id': 'ph',
      'label': 'Kadar pH',
      'unit': 'pH',
      'color': AppTheme.accentEmerald,
      'target': '6.5 - 7.5',
      'base': 6.95,
      'variance': 0.15,
    },
    {
      'id': 'temp',
      'label': 'Suhu Air',
      'unit': '°C',
      'color': AppTheme.accentCyan,
      'target': '24.0 - 28.0°C',
      'base': 24.5,
      'variance': 0.8,
    },
    {
      'id': 'do',
      'label': 'Oksigen (DO)',
      'unit': 'mg/L',
      'color': AppTheme.accentIndigo,
      'target': '> 5.0 mg/L',
      'base': 7.4,
      'variance': 0.35,
    },
    {
      'id': 'tds',
      'label': 'TDS Nutrisi',
      'unit': 'ppm',
      'color': AppTheme.accentYellowDeep,
      'target': '500 - 800 ppm',
      'base': 540.0,
      'variance': 25.0,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final metric = _metrics[_selectedMetricIndex];
    final color = metric['color'] as Color;

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

            // WQI Water Quality Index Score Bento Card
            _buildWQIScoreCard(),

            const SizedBox(height: 20),

            // Interactive Trend Chart Card
            _buildInteractiveTrendCard(telemetry, metric, color),

            const SizedBox(height: 20),

            // Bio-Equilibrium & Symbiosis Stats
            _buildBioEquilibriumCard(),

            const SizedBox(height: 20),

            // 24-Hour Statistical Summary Table
            _buildStatsTableCard(telemetry),

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
              color: AppTheme.accentCyan.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.auto_graph_rounded,
              color: AppTheme.accentCyan,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Analitik & Tren Telemetri',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Data Logging Real-Time • Water Quality Index (WQI)',
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

  Widget _buildWQIScoreCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.charcoal,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: AppTheme.softShadow,
      ),
      child: Row(
        children: [
          // Circular WQI Score Badge
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.charcoalSoft,
              border: Border.all(
                color: AppTheme.accentEmerald.withValues(alpha: 0.5),
                width: 3,
              ),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '94',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    fontFamily: 'monospace',
                  ),
                ),
                Text(
                  '/ 100',
                  style: TextStyle(
                    fontSize: 9.5,
                    color: AppTheme.accentEmerald,
                    fontWeight: FontWeight.bold,
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
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.accentEmerald.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'GRADE A+ OPTIMAL',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: AppTheme.accentEmerald,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Indeks Kualitas Air Prima',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Sinergi mikroba biofilter, aerasi DO, dan buffering pH stabil tanpa intervensi kimia.',
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

  Widget _buildInteractiveTrendCard(
    dynamic telemetry,
    Map<String, dynamic> metric,
    Color color,
  ) {
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
          // Metric Selector Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_metrics.length, (idx) {
                final isSelected = _selectedMetricIndex == idx;
                final m = _metrics[idx];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => setState(() => _selectedMetricIndex = idx),
                    borderRadius: BorderRadius.circular(999),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.charcoal : AppTheme.canvas,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: isSelected ? AppTheme.charcoal : AppTheme.borderLight,
                        ),
                      ),
                      child: Text(
                        m['label'],
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppTheme.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          const SizedBox(height: 20),

          // Current Value & Target
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
                    _getCurrentValueString(telemetry, metric['id']),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    metric['unit'],
                    style: TextStyle(
                      fontSize: 14,
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
                    'Rentang Ideal: ${metric['target']}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const Text(
                    '24 Jam Terakhir • 30 Data Points',
                    style: TextStyle(
                      fontSize: 9.5,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Custom Painted Chart
          SizedBox(
            height: 140,
            width: double.infinity,
            child: CustomPaint(
              painter: _TelemetrySplineChartPainter(
                lineColor: color,
                baseValue: (metric['base'] as num).toDouble(),
                variance: (metric['variance'] as num).toDouble(),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Time axis markers
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

  String _getCurrentValueString(dynamic telemetry, String id) {
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

  Widget _buildBioEquilibriumCard() {
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
              Icon(Icons.hub_rounded, color: AppTheme.charcoal, size: 18),
              SizedBox(width: 8),
              Text(
                'KESEIMBANGAN BIOLOGIS & BIO-FILTER',
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
          Row(
            children: [
              _buildBioItem('Konversi Amonia', '96.4%', 'Sangat Efisien', AppTheme.accentEmerald),
              const SizedBox(width: 8),
              _buildBioItem('Rasio Tanaman:Ikan', '1.4 : 1', 'Seimbang', AppTheme.accentCyan),
              const SizedBox(width: 8),
              _buildBioItem('Debit Bio-Sirkulasi', '250 L/jam', 'Stabil', AppTheme.accentYellowDeep),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBioItem(String label, String value, String status, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              status,
              style: TextStyle(
                fontSize: 9.5,
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

  Widget _buildStatsTableCard(dynamic telemetry) {
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
              Icon(Icons.table_chart_rounded, color: AppTheme.charcoal, size: 18),
              SizedBox(width: 8),
              Text(
                'RINGKASAN STATISTIK 24 JAM',
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
          _buildTableRow('Kadar pH', '6.85', '7.12', telemetry.sensors.ph.toStringAsFixed(2), 'Stabil'),
          const Divider(height: 16),
          _buildTableRow('Suhu Air', '23.8°C', '25.6°C', '${telemetry.sensors.waterTemperature.toStringAsFixed(1)}°C', 'Ideal'),
          const Divider(height: 16),
          _buildTableRow('Oksigen DO', '6.90 mg/L', '7.85 mg/L', '${telemetry.sensors.dissolvedOxygen.toStringAsFixed(2)} mg/L', 'Optimal'),
          const Divider(height: 16),
          _buildTableRow('TDS Nutrisi', '520 ppm', '565 ppm', '${telemetry.sensors.tds} ppm', 'Cukup'),
        ],
      ),
    );
  }

  Widget _buildTableRow(String param, String min, String max, String avg, String status) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        SizedBox(
          width: 90,
          child: Text(
            param,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
        ),
        Text('Min: $min', style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
        Text('Max: $max', style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
        Text(
          'Kini: $avg',
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: AppTheme.charcoal),
        ),
      ],
    );
  }
}

class _TelemetrySplineChartPainter extends CustomPainter {
  final Color lineColor;
  final double baseValue;
  final double variance;

  _TelemetrySplineChartPainter({
    required this.lineColor,
    required this.baseValue,
    required this.variance,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final width = size.width;
    final height = size.height;

    // Draw horizontal grid lines
    final gridPaint = Paint()
      ..color = AppTheme.borderLight.withValues(alpha: 0.8)
      ..strokeWidth = 1.0;

    for (int i = 1; i <= 3; i++) {
      final y = (height / 4) * i;
      canvas.drawLine(Offset(0, y), Offset(width, y), gridPaint);
    }

    // Generate smooth mock points based on baseValue & variance
    final points = <Offset>[];
    const pointCount = 14;
    final random = Random(42); // fixed seed for stable visual shape

    for (int i = 0; i < pointCount; i++) {
      final x = (width / (pointCount - 1)) * i;
      // organic wave shape
      final wave = sin(i * 0.7) * 0.5 + (random.nextDouble() - 0.5) * 0.6;
      final normalizedY = (0.5 + wave * 0.35).clamp(0.1, 0.9);
      final y = height * normalizedY;
      points.add(Offset(x, y));
    }

    // Path creation
    final path = Path();
    path.moveTo(points[0].dx, points[0].dy);

    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final controlX = (p0.dx + p1.dx) / 2;
      path.cubicTo(controlX, p0.dy, controlX, p1.dy, p1.dx, p1.dy);
    }

    // Gradient fill under the spline curve
    final fillPath = Path.from(path)
      ..lineTo(width, height)
      ..lineTo(0, height)
      ..close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lineColor.withValues(alpha: 0.25),
          lineColor.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, width, height));

    canvas.drawPath(fillPath, fillPaint);

    // Stroke line
    final strokePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(path, strokePaint);

    // Latest point indicator dot
    final lastPoint = points.last;
    final dotPaint = Paint()..color = lineColor;
    final whitePaint = Paint()..color = Colors.white;

    canvas.drawCircle(lastPoint, 6, dotPaint);
    canvas.drawCircle(lastPoint, 3, whitePaint);
  }

  @override
  bool shouldRepaint(covariant _TelemetrySplineChartPainter oldDelegate) {
    return oldDelegate.lineColor != lineColor;
  }
}
