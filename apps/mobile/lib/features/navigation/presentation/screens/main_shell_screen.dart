import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';
import '../widgets/universal_header.dart';
import '../../../dashboard/presentation/screens/dashboard_screen.dart';
import '../../../ecosystem/presentation/screens/ecosystem_screen.dart';
import '../../../controls/presentation/screens/controls_screen.dart';
import '../../../analytics/presentation/screens/analytics_screen.dart';
import '../../../agribot/presentation/screens/agribot_screen.dart';

class MainShellScreen extends ConsumerStatefulWidget {
  const MainShellScreen({super.key});

  @override
  ConsumerState<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends ConsumerState<MainShellScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    EcosystemScreen(),
    ControlsScreen(),
    AnalyticsScreen(),
    AgriBotScreen(),
  ];

  final List<Map<String, dynamic>> _navItems = const [
    {
      'label': 'Beranda',
      'icon': Icons.grid_view_rounded,
      'activeIcon': Icons.grid_view_rounded,
    },
    {
      'label': 'Ekosistem',
      'icon': Icons.layers_outlined,
      'activeIcon': Icons.layers_rounded,
    },
    {
      'label': 'Kontrol',
      'icon': Icons.toggle_off_outlined,
      'activeIcon': Icons.toggle_on_rounded,
    },
    {
      'label': 'Analitik',
      'icon': Icons.auto_graph_outlined,
      'activeIcon': Icons.auto_graph_rounded,
    },
    {
      'label': 'AgriBot',
      'icon': Icons.psychology_outlined,
      'activeIcon': Icons.psychology_rounded,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final telemetry = ref.watch(telemetryNotifierProvider);
    final notifier = ref.read(telemetryNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: Stack(
        children: [
          // Screen Content Area
          Column(
            children: [
              // Universal Header
              UniversalHeader(
                isLive: telemetry.isLive,
                activeAnomaly: telemetry.anomalyMode,
                onSelectAnomaly: notifier.setAnomaly,
              ),

              // Active Tab Screen (IndexedStack preserves state)
              Expanded(
                child: IndexedStack(
                  index: _currentIndex,
                  children: _screens,
                ),
              ),
            ],
          ),

          // Floating Bottom Navigation Bar (Warm Editorial Bento styled)
          Positioned(
            left: 16,
            right: 16,
            bottom: 20,
            child: _buildFloatingBottomNav(),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingBottomNav() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppTheme.borderMedium),
        boxShadow: AppTheme.floatingPillShadow,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(_navItems.length, (idx) {
          final item = _navItems[idx];
          final isSelected = _currentIndex == idx;

          return Expanded(
            child: InkWell(
              onTap: () {
                if (_currentIndex != idx) {
                  HapticFeedback.lightImpact();
                  setState(() => _currentIndex = idx);
                }
              },
              borderRadius: BorderRadius.circular(999),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.charcoal : Colors.transparent,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isSelected ? item['activeIcon'] : item['icon'],
                      size: 20,
                      color: isSelected ? Colors.white : AppTheme.textSecondary,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item['label'],
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? Colors.white : AppTheme.textSecondary,
                        fontFamily: 'monospace',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
