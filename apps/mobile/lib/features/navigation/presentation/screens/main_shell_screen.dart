import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';
import '../widgets/universal_header.dart';
import '../../../dashboard/presentation/screens/dashboard_screen.dart';
import '../../../controls/presentation/screens/controls_screen.dart';
import '../../../agribot/presentation/screens/agribot_screen.dart';
import '../../../analytics/presentation/screens/analytics_ai_screen.dart';
import '../../../tower/presentation/screens/tower_screen.dart';

class MainShellScreen extends ConsumerStatefulWidget {
  const MainShellScreen({super.key});

  @override
  ConsumerState<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends ConsumerState<MainShellScreen> {
  int _currentIndex = 0;

  List<Widget> get _screens => [
        DashboardScreen(
          onOpenTowerTab: () => setState(() => _currentIndex = 4), // Slot 5: Menara
          onOpenControlsTab: () => setState(() => _currentIndex = 1), // Slot 2: Kontrol
        ),
        const ControlsScreen(), // Slot 2: Kontrol Relay
        const AgriBotScreen(), // Slot 3: AgriBot AI (Center Highlighted)
        const AnalyticsAiScreen(), // Slot 4: Wawasan (Analitik & Prediksi AI)
        const TowerScreen(), // Slot 5: Menara Kaskade
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
              // Universal Header with official UrbanGrow logo
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

          // Floating Bottom Navigation Bar (High-End Scandinavian Agro-Tech Floating Dock)
          Positioned(
            left: 14,
            right: 14,
            bottom: 18,
            child: _buildFloatingBottomNav(),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingBottomNav() {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.98),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppTheme.borderLight, width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14111827),
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Slot 1: Dashboard
          Expanded(
            child: _buildStandardNavItem(
              index: 0,
              label: 'Dashboard',
              icon: Icons.grid_view_outlined,
              activeIcon: Icons.grid_view_rounded,
            ),
          ),

          // Slot 2: Kontrol Relay
          Expanded(
            child: _buildStandardNavItem(
              index: 1,
              label: 'Kontrol',
              icon: Icons.toggle_off_outlined,
              activeIcon: Icons.toggle_on_rounded,
            ),
          ),

          // Slot 3: AgriBot AI (Elevated Floating Center Action Button)
          _buildCenterAgriBotButton(),

          // Slot 4: Wawasan (Analitik IoT & Prediksi AI)
          Expanded(
            child: _buildStandardNavItem(
              index: 3,
              label: 'Wawasan',
              icon: Icons.insights_outlined,
              activeIcon: Icons.insights_rounded,
            ),
          ),

          // Slot 5: Menara Kaskade
          Expanded(
            child: _buildStandardNavItem(
              index: 4,
              label: 'Menara',
              icon: Icons.layers_outlined,
              activeIcon: Icons.layers_rounded,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStandardNavItem({
    required int index,
    required String label,
    required IconData icon,
    required IconData activeIcon,
  }) {
    final isSelected = _currentIndex == index;

    return InkWell(
      onTap: () {
        if (_currentIndex != index) {
          HapticFeedback.lightImpact();
          setState(() => _currentIndex = index);
        }
      },
      borderRadius: BorderRadius.circular(999),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              size: isSelected ? 21 : 19,
              color: isSelected ? AppTheme.pinePrimary : AppTheme.textMuted,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? AppTheme.pinePrimary : AppTheme.textSecondary,
                letterSpacing: -0.2,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            // Active Botanical Indicator Dot
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              width: isSelected ? 4 : 0,
              height: isSelected ? 4 : 0,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.sageMint,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterAgriBotButton() {
    final isSelected = _currentIndex == 2;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: InkWell(
        onTap: () {
          if (_currentIndex != 2) {
            HapticFeedback.mediumImpact();
            setState(() => _currentIndex = 2);
          }
        },
        borderRadius: BorderRadius.circular(999),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 240),
          curve: Curves.easeOutCubic,
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF165B39),
                Color(0xFF0F3F27),
              ],
            ),
            shape: BoxShape.circle,
            border: Border.all(
              color: isSelected ? AppTheme.sageMint : Colors.white,
              width: isSelected ? 2.5 : 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF165B39).withValues(alpha: isSelected ? 0.45 : 0.28),
                blurRadius: isSelected ? 16 : 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSelected ? Icons.psychology_rounded : Icons.auto_awesome_rounded,
                size: 20,
                color: isSelected ? AppTheme.sageMint : Colors.white,
              ),
              const SizedBox(height: 1),
              Text(
                'AgriBot',
                style: TextStyle(
                  fontSize: 8.5,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                  color: isSelected ? AppTheme.sageMint : Colors.white,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
