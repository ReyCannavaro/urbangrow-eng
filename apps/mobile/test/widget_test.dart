import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/main.dart';

void main() {
  setUpAll(() async {
    await initializeDateFormatting('id_ID', null);
  });

  testWidgets('UrbanGrow app boots smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: UrbanGrowMobileApp(),
      ),
    );

    expect(find.byType(UrbanGrowMobileApp), findsOneWidget);

    // Fast-forward past splash boot sequence
    await tester.pump(const Duration(milliseconds: 700));
    await tester.pump(const Duration(milliseconds: 900));
    await tester.pump(const Duration(milliseconds: 800));

    // Cleanly unmount tree to cancel any active timers
    await tester.pumpWidget(const SizedBox.shrink());
  });
}
