import 'package:flutter/material.dart';
import 'analytics_ai_screen.dart';

export 'analytics_ai_screen.dart';

/// Legacy screen wrapper routing to unified dual-view AnalyticsAiScreen
class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AnalyticsAiScreen();
  }
}
