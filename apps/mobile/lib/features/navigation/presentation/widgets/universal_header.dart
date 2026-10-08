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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        border: Border(
          bottom: BorderSide(color: AppTheme.borderLight),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Brand Logo Pill (Pine Botanical Donezo Style)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 9,
                    height: 9,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.pinePrimary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'UrbanGrow',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Backend Connectivity Pill (Human-Friendly Donezo Style)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: isLive ? AppTheme.mintWash : AppTheme.surface,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: isLive
                      ? AppTheme.statusOptimal.withValues(alpha: 0.25)
                      : AppTheme.borderLight,
                ),
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
                      color: isLive ? AppTheme.statusOptimal : AppTheme.statusWarning,
                      boxShadow: [
                        BoxShadow(
                          color: (isLive ? AppTheme.statusOptimal : AppTheme.statusWarning)
                              .withValues(alpha: 0.4),
                          blurRadius: 4,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isLive ? 'Tersinkron' : 'Menghubungkan...',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: isLive ? AppTheme.mintText : AppTheme.statusWarning,
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
                  color: AppTheme.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderLight),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(
                      Icons.notifications_none_rounded,
                      size: 19,
                      color: AppTheme.textPrimary,
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: activeAnomaly != 'none'
                              ? AppTheme.statusAlert
                              : AppTheme.sageMint,
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
