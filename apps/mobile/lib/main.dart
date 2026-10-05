import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/dashboard/presentation/screens/dashboard_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: UrbanGrowMobileApp(),
    ),
  );
}

class UrbanGrowMobileApp extends StatelessWidget {
  const UrbanGrowMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UrbanGrow Mobile IoT',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const DashboardScreen(),
    );
  }
}
