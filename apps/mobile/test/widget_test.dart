import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('UrbanGrow app boots smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: UrbanGrowMobileApp(),
      ),
    );

    expect(find.byType(UrbanGrowMobileApp), findsOneWidget);
  });
}
