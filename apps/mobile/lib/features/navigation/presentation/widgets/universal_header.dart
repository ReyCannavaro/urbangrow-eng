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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.cardBg,
        border: Border(
          bottom: BorderSide(color: AppTheme.borderLight.withValues(alpha: 0.6)),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Brand Logo Pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppTheme.borderMedium),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(
                    'assets/images/urbangrow-logo.png',
                    height: 18,
                    fit: BoxFit.contain,
                    errorBuilder: (_, _, _) => const Text(
                      'URBANGROW',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.charcoal,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 1,
                    height: 12,
                    color: AppTheme.borderLight,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'IoT Core',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Backend Connectivity Pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6.5,
                    height: 6.5,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isLive
                          ? AppTheme.accentEmerald
                          : AppTheme.accentYellowDeep,
                      boxShadow: [
                        BoxShadow(
                          color: (isLive
                                  ? AppTheme.accentEmerald
                                  : AppTheme.accentYellowDeep)
                              .withValues(alpha: 0.4),
                          blurRadius: 4,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isLive ? 'Elysia :3000' : 'Simulated',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      color: isLive
                          ? AppTheme.accentEmeraldDark
                          : AppTheme.accentYellowDeep,
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
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderMedium),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(
                      Icons.notifications_outlined,
                      size: 18,
                      color: AppTheme.charcoal,
                    ),
                    Positioned(
                      top: 7,
                      right: 7,
                      child: Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: activeAnomaly != 'none'
                              ? AppTheme.accentCoral
                              : AppTheme.accentYellowDeep,
                          border: Border.all(color: Colors.white, width: 1.2),
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
