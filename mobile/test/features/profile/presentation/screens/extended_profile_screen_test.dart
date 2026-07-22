import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tayyibt/features/profile/domain/entities/profile.dart';
import 'package:tayyibt/features/profile/presentation/providers/profile_providers.dart';
import 'package:tayyibt/features/profile/presentation/screens/extended_profile_screen.dart';

const _testProfile = Profile(id: 'p1', interests: [], skills: []);

Future<void> _pump(WidgetTester tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        myProfileProvider.overrideWith((ref) async => _testProfile),
      ],
      child: const MaterialApp(home: ExtendedProfileScreen()),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('tapping a preset tag selects it', (tester) async {
    await _pump(tester);

    final chip = find.widgetWithText(FilterChip, 'قراءة');
    expect(chip, findsOneWidget);
    expect(tester.widget<FilterChip>(chip).selected, isFalse);

    await tester.ensureVisible(chip);
    await tester.pumpAndSettle();
    await tester.tap(chip);
    await tester.pumpAndSettle();

    expect(tester.widget<FilterChip>(find.widgetWithText(FilterChip, 'قراءة')).selected, isTrue);
  });

  testWidgets('typing a custom tag and submitting adds it as a removable chip', (tester) async {
    await _pump(tester);

    final fields = find.widgetWithText(TextField, 'اكتب ما يميّزك ولم تجده في القائمة...');
    expect(fields, findsWidgets);

    await tester.enterText(fields.first, 'تربية النحل');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    expect(find.widgetWithText(FilterChip, 'تربية النحل'), findsOneWidget);
  });
}
