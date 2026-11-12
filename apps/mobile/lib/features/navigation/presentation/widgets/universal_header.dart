import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../alerts/presentation/widgets/alerts_modal_sheet.dart';

class UniversalHeader extends StatelessWidget {
  final bool isLive;
  final String activeAnomaly;
  final Function(String) onSelectAnomaly;

  const UniversalHeader({
    super.key,
    required this.isLive,
    required this.activeAnomaly,
    required this.onSelectAnomaly,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: AppTheme.borderLight, width: 1.0),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Official UrbanGrow Wordmark Pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Image.asset(
                'assets/images/urbangrow-logo.png',
                height: 26,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.eco_rounded, size: 16, color: AppTheme.pinePrimary),
                    SizedBox(width: 6),
                    Text(
                      'UrbanGrow',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            // Hardware Connectivity Status Pill (Clear Live vs Offline)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5.5),
              decoration: BoxDecoration(
                color: isLive ? AppTheme.mintWash : const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: isLive
                      ? AppTheme.statusOptimal.withValues(alpha: 0.25)
                      : const Color(0xFFFDE68A),
                ),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isLive ? AppTheme.statusOptimal : const Color(0xFFD97706),
                      boxShadow: [
                        BoxShadow(
                          color: (isLive ? AppTheme.statusOptimal : const Color(0xFFD97706))
                              .withValues(alpha: 0.35),
                          blurRadius: 4,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isLive ? 'ESP32 Live' : 'Node Offline',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: isLive ? AppTheme.mintText : const Color(0xFFB45309),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Notification Bell Pill Button
            InkWell(
              onTap: () {
                AlertsModalSheet.show(
                  context,
                  activeAnomaly: activeAnomaly,
                  onSelectAnomaly: onSelectAnomaly,
                  isBackendLive: isLive,
                );
              },
              borderRadius: BorderRadius.circular(999),
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderLight),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(
                      Icons.notifications_none_rounded,
                      size: 20,
                      color: AppTheme.textPrimary,
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        width: 7.5,
                        height: 7.5,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: activeAnomaly != 'none'
                              ? AppTheme.statusAlert
                              : AppTheme.sageMint,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
