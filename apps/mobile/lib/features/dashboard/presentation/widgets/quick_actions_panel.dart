import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class QuickActionsPanel extends StatelessWidget {
  final VoidCallback onDispenseFeed;
  final bool isDispensing;
  final String activeAnomaly;
  final ValueChanged<String> onSelectAnomaly;

  const QuickActionsPanel({
    super.key,
    required this.onDispenseFeed,
    required this.isDispensing,
    required this.activeAnomaly,
    required this.onSelectAnomaly,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quick Feed Dispenser
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppTheme.borderLight),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Dispensasi Pakan Cepat',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Kirim 35 gram pelet langsung ke Level 3 (Nila) & Level 1 (Lele)',
                style: TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  onPressed: isDispensing ? null : onDispenseFeed,
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        isDispensing ? AppTheme.accentEmerald : AppTheme.charcoal,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  icon: isDispensing
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send, size: 16),
                  label: Text(
                    isDispensing ? 'Pakan Berhasil Disebar!' : 'Beri Pakan Sekarang',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Anomaly Simulation Suite
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppTheme.borderLight),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Simulasi Uji Stres',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    'MODE: ${activeAnomaly.toUpperCase()}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.accentYellowDeep,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildModeChip('Normal', 'none', const Color(0xFF78716C)),
                  _buildModeChip('Drop pH', 'ph_drop', AppTheme.accentCoral),
                  _buildModeChip('Gelombang Panas', 'heatwave', AppTheme.accentYellowDeep),
                  _buildModeChip('Spike TDS', 'tds_spike', AppTheme.accentCyan),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildModeChip(String label, String mode, Color color) {
    final isSelected = activeAnomaly == mode;

    return InkWell(
      onTap: () => onSelectAnomaly(mode),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.charcoal : AppTheme.canvas,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppTheme.charcoal : AppTheme.borderLight,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.textPrimary,
          ),
        ),
      ),
    );
  }
}
