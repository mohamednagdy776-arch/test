import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:tayyibt/main.dart';

void main() {
  testWidgets('TayyibtApp builds without throwing', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: TayyibtApp()));
    await tester.pump();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
