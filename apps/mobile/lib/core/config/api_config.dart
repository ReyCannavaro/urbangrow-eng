class ApiConfig {
  /// Base URL can be injected via --dart-define=API_URL=https://...
  /// Default set to the active Cloudflare Tunnel
  static const String _defaultUrl = 'https://tremendous-finger-live-chance.trycloudflare.com';
  
  static String get baseUrl => const String.fromEnvironment('API_URL', defaultValue: _defaultUrl);

  static String get currentTelemetry => '$baseUrl/api/sensors/current';
  static String get history => '$baseUrl/api/sensors/history';
  static String get alerts => '$baseUrl/api/alerts';
  static String toggleActuator(String id) => '$baseUrl/api/actuators/$id/toggle';
  static String get anomaly => '$baseUrl/api/simulation/anomaly';
}
