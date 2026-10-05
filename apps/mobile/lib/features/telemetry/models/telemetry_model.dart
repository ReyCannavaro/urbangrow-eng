class SensorData {
  final double ph;
  final int tds;
  final double waterTemperature;
  final double airTemperature;
  final double humidity;
  final int lightIntensity;
  final double dissolvedOxygen;
  final double waterLevel;

  const SensorData({
    required this.ph,
    required this.tds,
    required this.waterTemperature,
    required this.airTemperature,
    required this.humidity,
    required this.lightIntensity,
    required this.dissolvedOxygen,
    required this.waterLevel,
  });

  factory SensorData.fromJson(Map<String, dynamic> json) {
    return SensorData(
      ph: (json['ph'] as num?)?.toDouble() ?? 7.0,
      tds: (json['tds'] as num?)?.toInt() ?? 540,
      waterTemperature: (json['waterTemperature'] as num?)?.toDouble() ?? 24.5,
      airTemperature: (json['airTemperature'] as num?)?.toDouble() ?? 27.0,
      humidity: (json['humidity'] as num?)?.toDouble() ?? 65.0,
      lightIntensity: (json['lightIntensity'] as num?)?.toInt() ?? 650,
      dissolvedOxygen: (json['dissolvedOxygen'] as num?)?.toDouble() ?? 7.2,
      waterLevel: (json['waterLevel'] as num?)?.toDouble() ?? 92.0,
    );
  }

  factory SensorData.fallback() {
    return const SensorData(
      ph: 6.95,
      tds: 540,
      waterTemperature: 24.3,
      airTemperature: 27.2,
      humidity: 65.4,
      lightIntensity: 680,
      dissolvedOxygen: 7.32,
      waterLevel: 92.4,
    );
  }
}

class ActuatorItem {
  final String id;
  final String name;
  final String type;
  final bool isOn;
  final int powerWatts;

  const ActuatorItem({
    required this.id,
    required this.name,
    required this.type,
    required this.isOn,
    required this.powerWatts,
  });

  factory ActuatorItem.fromJson(String id, Map<String, dynamic> json) {
    return ActuatorItem(
      id: id,
      name: json['name'] as String? ?? id,
      type: json['type'] as String? ?? 'generic',
      isOn: json['isOn'] as bool? ?? false,
      powerWatts: (json['powerWatts'] as num?)?.toInt() ?? 20,
    );
  }

  ActuatorItem copyWith({bool? isOn}) {
    return ActuatorItem(
      id: id,
      name: name,
      type: type,
      isOn: isOn ?? this.isOn,
      powerWatts: powerWatts,
    );
  }
}

class TelemetrySnapshot {
  final DateTime timestamp;
  final SensorData sensors;
  final Map<String, ActuatorItem> actuators;
  final String status;
  final String anomalyMode;
  final bool isLive;

  final bool isFeedDispensing;

  const TelemetrySnapshot({
    required this.timestamp,
    required this.sensors,
    required this.actuators,
    required this.status,
    required this.anomalyMode,
    required this.isLive,
    this.isFeedDispensing = false,
  });

  factory TelemetrySnapshot.fromJson(Map<String, dynamic> json, {bool isLive = true}) {
    final sensors = SensorData.fromJson(json['sensors'] as Map<String, dynamic>? ?? {});
    final actRaw = json['actuators'] as Map<String, dynamic>? ?? {};
    final actuators = <String, ActuatorItem>{};

    actRaw.forEach((key, val) {
      if (val is Map<String, dynamic>) {
        actuators[key] = ActuatorItem.fromJson(key, val);
      }
    });

    final sys = json['system'] as Map<String, dynamic>? ?? {};

    return TelemetrySnapshot(
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ?? DateTime.now(),
      sensors: sensors,
      actuators: actuators,
      status: sys['status'] as String? ?? 'optimal',
      anomalyMode: sys['anomalyMode'] as String? ?? 'none',
      isLive: isLive,
      isFeedDispensing: false,
    );
  }

  TelemetrySnapshot copyWith({
    DateTime? timestamp,
    SensorData? sensors,
    Map<String, ActuatorItem>? actuators,
    String? status,
    String? anomalyMode,
    bool? isLive,
    bool? isFeedDispensing,
  }) {
    return TelemetrySnapshot(
      timestamp: timestamp ?? this.timestamp,
      sensors: sensors ?? this.sensors,
      actuators: actuators ?? this.actuators,
      status: status ?? this.status,
      anomalyMode: anomalyMode ?? this.anomalyMode,
      isLive: isLive ?? this.isLive,
      isFeedDispensing: isFeedDispensing ?? this.isFeedDispensing,
    );
  }

  factory TelemetrySnapshot.initial() {
    return TelemetrySnapshot(
      timestamp: DateTime.now(),
      sensors: SensorData.fallback(),
      actuators: {
        'waterPump': const ActuatorItem(
          id: 'waterPump',
          name: 'Sirkulasi Pompa Air 12V',
          type: 'pump',
          isOn: true,
          powerWatts: 45,
        ),
        'aerator': const ActuatorItem(
          id: 'aerator',
          name: 'Aerator Oksigen Nila',
          type: 'aerator',
          isOn: true,
          powerWatts: 18,
        ),
        'growLight': const ActuatorItem(
          id: 'growLight',
          name: 'LED Grow Light Fotosintesis',
          type: 'light',
          isOn: false,
          powerWatts: 85,
        ),
        'feeder': const ActuatorItem(
          id: 'feeder',
          name: 'Feeder Otomatis',
          type: 'feeder',
          isOn: true,
          powerWatts: 12,
        ),
      },
      status: 'connecting',
      anomalyMode: 'none',
      isLive: false,
      isFeedDispensing: false,
    );
  }
}
