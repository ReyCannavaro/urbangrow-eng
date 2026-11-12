class CropHarvestItem {
  final String cropName;
  final String level;
  final String growthStage;
  final int daysToHarvest;
  final int accumulatedGdd;
  final int targetGdd;
  final int progressPct;
  final int projectedBiomassGrams;
  final double lightEfficiencyPct;

  const CropHarvestItem({
    required this.cropName,
    required this.level,
    required this.growthStage,
    required this.daysToHarvest,
    required this.accumulatedGdd,
    required this.targetGdd,
    required this.progressPct,
    required this.projectedBiomassGrams,
    required this.lightEfficiencyPct,
  });

  factory CropHarvestItem.fromJson(Map<String, dynamic> json) {
    final accumulated = (json['accumulatedGdd'] as num?)?.toInt() ?? 280;
    final target = (json['targetGdd'] as num?)?.toInt() ?? 450;
    final progress = target > 0 ? ((accumulated / target) * 100).clamp(0, 100).round() : 62;

    return CropHarvestItem(
      cropName: json['cropName'] as String? ?? 'Pakcoy',
      level: json['level'] as String? ?? 'Level 4',
      growthStage: json['growthStage'] as String? ?? 'Vegetatif Akhir',
      daysToHarvest: (json['daysToHarvest'] as num?)?.toInt() ?? 7,
      accumulatedGdd: accumulated,
      targetGdd: target,
      progressPct: (json['progressPct'] as num?)?.toInt() ?? progress,
      projectedBiomassGrams: (json['projectedBiomassGrams'] as num?)?.toInt() ?? 145,
      lightEfficiencyPct: (json['lightEfficiencyPct'] as num?)?.toDouble() ?? 94.5,
    );
  }

  factory CropHarvestItem.pakcoyFallback() {
    return const CropHarvestItem(
      cropName: 'Pakcoy',
      level: 'Level 4',
      growthStage: 'Vegetatif Daun Rimbun',
      daysToHarvest: 7,
      accumulatedGdd: 310,
      targetGdd: 450,
      progressPct: 69,
      projectedBiomassGrams: 155,
      lightEfficiencyPct: 96.2,
    );
  }

  factory CropHarvestItem.kangkungFallback() {
    return const CropHarvestItem(
      cropName: 'Kangkung',
      level: 'Level 3',
      growthStage: 'Biofilter Vegetatif Cepat',
      daysToHarvest: 4,
      accumulatedGdd: 260,
      targetGdd: 320,
      progressPct: 81,
      projectedBiomassGrams: 190,
      lightEfficiencyPct: 98.0,
    );
  }
}

class FishHarvestItem {
  final String species;
  final String level;
  final String growthStage;
  final double currentLengthCm;
  final double targetLengthCm;
  final double currentWeightGrams;
  final double targetWeightGrams;
  final int daysRemaining;
  final int progressPct;
  final double fcr;

  const FishHarvestItem({
    required this.species,
    required this.level,
    required this.growthStage,
    required this.currentLengthCm,
    required this.targetLengthCm,
    required this.currentWeightGrams,
    required this.targetWeightGrams,
    required this.daysRemaining,
    required this.progressPct,
    required this.fcr,
  });

  factory FishHarvestItem.fromJson(Map<String, dynamic> json) {
    return FishHarvestItem(
      species: json['species'] as String? ?? 'Ikan Nila',
      level: json['level'] as String? ?? 'Level 2',
      growthStage: json['growthStage'] as String? ?? 'Pembesaran Aktif',
      currentLengthCm: (json['currentLengthCm'] as num?)?.toDouble() ?? 16.5,
      targetLengthCm: (json['targetLengthCm'] as num?)?.toDouble() ?? 22.0,
      currentWeightGrams: (json['currentWeightGrams'] as num?)?.toDouble() ?? 210.0,
      targetWeightGrams: (json['targetWeightGrams'] as num?)?.toDouble() ?? 350.0,
      daysRemaining: (json['daysRemaining'] as num?)?.toInt() ?? 24,
      progressPct: (json['progressPct'] as num?)?.toInt() ?? 68,
      fcr: (json['fcr'] as num?)?.toDouble() ?? 1.18,
    );
  }

  factory FishHarvestItem.nilaFallback() {
    return const FishHarvestItem(
      species: 'Ikan Nila Merah',
      level: 'Kolam Sekat 1',
      growthStage: 'Fase Pembesaran Komersial',
      currentLengthCm: 17.2,
      targetLengthCm: 22.0,
      currentWeightGrams: 235.0,
      targetWeightGrams: 350.0,
      daysRemaining: 21,
      progressPct: 72,
      fcr: 1.15,
    );
  }

  factory FishHarvestItem.leleFallback() {
    return const FishHarvestItem(
      species: 'Ikan Lele Sangkuriang',
      level: 'Kolam Sekat 2',
      growthStage: 'Fase Akhir Toleran Amonia',
      currentLengthCm: 21.0,
      targetLengthCm: 26.0,
      currentWeightGrams: 165.0,
      targetWeightGrams: 200.0,
      daysRemaining: 12,
      progressPct: 82,
      fcr: 1.08,
    );
  }
}

