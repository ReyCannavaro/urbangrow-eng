class ClimateScoreModel {
  final double score;
  final String grade;
  final double tempStability;
  final double waterQuality;
  final double dissolvedOxygen;
  final double photoperiod;
  final List<String> insights;

  ClimateScoreModel({
    required this.score,
    required this.grade,
    required this.tempStability,
    required this.waterQuality,
    required this.dissolvedOxygen,
    required this.photoperiod,
    required this.insights,
  });

  factory ClimateScoreModel.fromJson(Map<String, dynamic> json) {
    final sub = json['sub_scores'] as Map<String, dynamic>? ?? {};
    final insightList = (json['insights'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];

    return ClimateScoreModel(
      score: (json['climate_adaptation_score'] as num?)?.toDouble() ?? 80.0,
      grade: json['resilience_grade'] as String? ?? 'OPTIMAL',
      tempStability: (sub['temperature_stability'] as num?)?.toDouble() ?? 80.0,
      waterQuality: (sub['water_quality'] as num?)?.toDouble() ?? 80.0,
      dissolvedOxygen: (sub['dissolved_oxygen'] as num?)?.toDouble() ?? 80.0,
      photoperiod: (sub['photoperiod_consistency'] as num?)?.toDouble() ?? 80.0,
      insights: insightList,
    );
  }
}
