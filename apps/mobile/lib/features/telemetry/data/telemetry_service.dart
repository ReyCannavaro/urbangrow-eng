import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/config/api_config.dart';
import '../models/telemetry_model.dart';

class TelemetryService {
  final http.Client _client;

  TelemetryService({http.Client? client}) : _client = client ?? http.Client();

  /// Fetch live sensor & actuator snapshot from backend tunnel
  Future<TelemetrySnapshot> fetchCurrent() async {
    try {
      final response = await _client.get(
        Uri.parse(ApiConfig.currentTelemetry),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        return TelemetrySnapshot.fromJson(json, isLive: true);
      }
      throw Exception('Server returned ${response.statusCode}');
    } catch (e) {
      rethrow;
    }
  }

  /// Toggle actuator on/off via POST /api/actuators/:id/toggle
  Future<bool> toggleActuator(String id) async {
    try {
      final response = await _client.post(
        Uri.parse(ApiConfig.toggleActuator(id)),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        return json['success'] == true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Trigger anomaly test simulation
  Future<bool> setAnomaly(String mode) async {
    try {
      final response = await _client.post(
        Uri.parse(ApiConfig.anomaly),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'type': mode}),
      ).timeout(const Duration(seconds: 4));

      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
