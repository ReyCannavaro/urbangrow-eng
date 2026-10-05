---
name: flutter-mobile-engineering
description: Comprehensive Flutter and Dart engineering skill for the UrbanGrow mobile application (apps/mobile). Covers Flutter 3.x, Riverpod state management, real-time WebSocket/SSE sensor streams, custom aquaponics telemetry widgets (gauges, tank levels, charts), actuator toggles, offline caching, and push notifications.
---

# 📱 Flutter Mobile Engineering & Real-Time IoT Controls

> **Core Focus**: Production-grade, cross-platform mobile application development in `apps/mobile` using **Flutter**, **Dart**, **Riverpod**, and **WebSockets** for **UrbanGrow Smart Aquaponics Control Center**.

---

## 🏗️ 1. ARCHITECTURE & FOLDER STRUCTURE (`apps/mobile/lib`)

Feature-first modular architecture:

```
apps/mobile/lib/
├── core/
│   ├── constants/
│   │   ├── app_colors.ts      # Green, cyan, warning yellow, danger red
│   │   └── api_constants.dart # Backend URLs & WS endpoints
│   ├── network/
│   │   ├── api_client.dart    # Dio / HTTP client
│   │   └── websocket_client.dart # Auto-reconnecting WebSocket stream
│   ├── theme/
│   │   ├── app_theme.dart     # Light & High-Contrast Greenhouse Dark Mode
│   │   └── typography.dart
│   └── utils/
│       └── formatters.dart
├── features/
│   ├── dashboard/
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   └── sensor_stream_controller.dart # Riverpod StreamProvider
│   │   │   ├── screens/
│   │   │   │   └── dashboard_screen.dart
│   │   │   └── widgets/
│   │   │       ├── sensor_gauge_card.dart
│   │   │       ├── water_tank_indicator.dart
│   │   │       └── system_status_badge.dart
│   │   └── data/
│   │       └── models/
│   │           └── sensor_telemetry_model.dart
│   ├── actuators/
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   └── actuator_controller.dart
│   │   │   └── widgets/
│   │   │       └── actuator_toggle_card.dart
│   │   └── data/
│   │       └── actuator_repository.dart
│   ├── analytics/
│   │   └── presentation/
│   │       └── screens/
│   │           └── historical_charts_screen.dart
│   └── alerts/
│       └── presentation/
│           └── widgets/
│               └── alert_banner_card.dart
└── main.dart
```

---

## ⚡ 2. RIVERPOD STATE MANAGEMENT & REAL-TIME STREAMING

### 2.A Sensor Telemetry Model (`sensor_telemetry_model.dart`)
```dart
class SensorTelemetry {
  final double ph;
  final int tds;
  final double waterTemperature;
  final double airTemperature;
  final double humidity;
  final int lightIntensity;
  final DateTime timestamp;

  const SensorTelemetry({
    required this.ph,
    required this.tds,
    required this.waterTemperature,
    required this.airTemperature,
    required this.humidity,
    required this.lightIntensity,
    required this.timestamp,
  });

  factory SensorTelemetry.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return SensorTelemetry(
      ph: (data['ph'] as num).toDouble(),
      tds: (data['tds'] as num).toInt(),
      waterTemperature: (data['waterTemperature'] as num).toDouble(),
      airTemperature: (data['airTemperature'] as num).toDouble(),
      humidity: (data['humidity'] as num).toDouble(),
      lightIntensity: (data['lightIntensity'] as num).toInt(),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}
```

### 2.B WebSocket Stream Provider (`sensor_stream_controller.dart`)
```dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/sensor_telemetry_model.dart';

final telemetryStreamProvider = StreamProvider.autoDispose<SensorTelemetry>((ref) {
  final controller = StreamController<SensorTelemetry>();
  final channel = WebSocketChannel.connect(
    Uri.parse('ws://10.0.2.2:3000/ws/telemetry'), // Android Emulator localhost bridge
  );

  final subscription = channel.stream.listen(
    (message) {
      try {
        final Map<String, dynamic> decoded = jsonDecode(message as String);
        if (decoded.containsKey('data')) {
          controller.add(SensorTelemetry.fromJson(decoded));
        }
      } catch (e) {
        // Handle malformed socket message
      }
    },
    onError: (error) {
      controller.addError(error);
    },
  );

  ref.onDispose(() {
    subscription.cancel();
    channel.sink.close();
    controller.close();
  });

  return controller.stream;
});
```

---

## 🎨 3. CUSTOM AQUAPONICS UI WIDGETS

### Sensor Metric Card (`sensor_gauge_card.dart`):
```dart
import 'package:flutter/material.dart';

enum MetricStatus { optimal, warning, critical }

class SensorGaugeCard extends StatelessWidget {
  final String title;
  final String value;
  final String unit;
  final IconData icon;
  final MetricStatus status;

  const SensorGaugeCard({
    super.key,
    required this.title,
    required this.value,
    required this.unit,
    required this.icon,
    this.status = MetricStatus.optimal,
  });

  Color _getStatusColor() {
    switch (status) {
      case MetricStatus.optimal:
        return const Color(0xFF10B981); // Emerald Green
      case MetricStatus.warning:
        return const Color(0xFFF59E0B); // Amber Warning
      case MetricStatus.critical:
        return const Color(0xFFEF4444); // Crimson Danger
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B), // Dark slate
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70),
              ),
              Icon(icon, color: statusColor, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(width: 4),
              Text(
                unit,
                style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.6)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## 🎛️ 4. ACTUATOR CONTROLS WITH OPTIMISTIC UPDATES

```dart
final actuatorStateProvider = StateNotifierProvider<ActuatorNotifier, Map<String, bool>>((ref) {
  return ActuatorNotifier();
});

class ActuatorNotifier extends StateNotifier<Map<String, bool>> {
  ActuatorNotifier() : super({'pump': true, 'aerator': true, 'light': false});

  Future<void> toggleActuator(String key) async {
    final previous = state[key] ?? false;
    // 1. Optimistic UI update
    state = {...state, key: !previous};

    try {
      // 2. HTTP POST to Elysia backend
      // await dio.post('/api/actuators/$key/toggle', data: {'state': !previous});
    } catch (e) {
      // 3. Rollback on failure
      state = {...state, key: previous};
    }
  }
}
```

---

## 🛡️ 5. BEST PRACTICES & MOBILE PERFORMANCE

1. **High Sunlight Contrast**: Outdoor aquaponics installations require high contrast typography and distinct status badges (emerald green vs crimson red).
2. **Reconnection Backoff**: Always implement exponential backoff on WebSocket reconnection to avoid battery drain when the local server is temporarily offline.
3. **Throttled Re-renders**: For sensors streaming at 1Hz or higher, throttle UI redraws using `StreamTransformer` or distinct operator to keep frame rate locked at 60/120 FPS.
4. **Haptic Feedback**: Trigger subtle haptic clicks (`HapticFeedback.lightImpact()`) whenever the user flips manual actuator switches (pump/aerator/light).
