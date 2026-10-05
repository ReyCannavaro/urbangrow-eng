import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/telemetry_service.dart';
import '../models/telemetry_model.dart';

final telemetryServiceProvider = Provider<TelemetryService>((ref) {
  return TelemetryService();
});

final telemetryNotifierProvider =
    NotifierProvider<TelemetryNotifier, TelemetrySnapshot>(() {
  return TelemetryNotifier();
});

class TelemetryNotifier extends Notifier<TelemetrySnapshot> {
  Timer? _timer;

  @override
  TelemetrySnapshot build() {
    ref.onDispose(() {
      _timer?.cancel();
    });

    _startPolling();

    return TelemetrySnapshot.initial();
  }

  void _startPolling() {
    _timer?.cancel();
    // initial fetch
    Future.microtask(() => fetchLatest());
    _timer = Timer.periodic(const Duration(seconds: 2), (_) {
      fetchLatest();
    });
  }

  Future<void> fetchLatest() async {
    try {
      final service = ref.read(telemetryServiceProvider);
      final fresh = await service.fetchCurrent();
      state = fresh;
    } catch (_) {
      if (state.isLive) {
        state = state.copyWith(
          status: 'offline_cache',
          isLive: false,
        );
      }
    }
  }

  Future<void> toggleActuator(String id) async {
    final currentActuator = state.actuators[id];
    if (currentActuator == null) return;

    final optimisticState = !currentActuator.isOn;

    final updatedMap = Map<String, ActuatorItem>.from(state.actuators);
    updatedMap[id] = currentActuator.copyWith(isOn: optimisticState);

    state = state.copyWith(actuators: updatedMap);

    final service = ref.read(telemetryServiceProvider);
    final success = await service.toggleActuator(id);
    if (!success) {
      final rollbackMap = Map<String, ActuatorItem>.from(state.actuators);
      rollbackMap[id] = currentActuator;
      state = state.copyWith(actuators: rollbackMap);
    }
  }

  Future<void> dispenseFeed() async {
    state = state.copyWith(isFeedDispensing: true);
    await Future.delayed(const Duration(milliseconds: 1800));
    state = state.copyWith(isFeedDispensing: false);
  }

  Future<void> setAnomaly(String mode) async {
    final service = ref.read(telemetryServiceProvider);
    await service.setAnomaly(mode);
    fetchLatest();
  }
}
