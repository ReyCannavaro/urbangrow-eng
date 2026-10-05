import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class MobileHeader extends StatelessWidget {
  final bool isLive;
  final int totalWatts;

  const MobileHeader({
    super.key,
    required this.isLive,
    required this.totalWatts,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppTheme.borderLight),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo & Title
          Row(
            children: [
              Image.asset(
                'assets/images/urbangrow-logo.png',
                height: 24,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(
                  Icons.eco,
                  color: AppTheme.accentEmerald,
                  size: 22,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 1,
                height: 14,
                color: AppTheme.borderMedium,
              ),
              const SizedBox(width: 8),
              const Text(
                'MOBILE IoT',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'monospace',
                  color: AppTheme.textSecondary,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),

          // Live Status Pill & Total Watts
          Row(
            children: [
              // Live Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: isLive ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isLive ? const Color(0xFFA7F3D0) : const Color(0xFFFDE68A),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isLive ? AppTheme.accentEmerald : AppTheme.accentYellowDeep,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      isLive ? 'LIVE' : 'SYNC',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: isLive ? const Color(0xFF065F46) : const Color(0xFF92400E),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Power Watts
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.canvas,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${totalWatts}W',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
