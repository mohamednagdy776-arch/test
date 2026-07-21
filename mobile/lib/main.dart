import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/constants/theme.dart';
import 'core/router/app_router.dart';

void main() {
  runApp(const ProviderScope(child: TayyibtApp()));
}

class TayyibtApp extends ConsumerWidget {
  const TayyibtApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Tayyibt',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // Arabic-only, RTL app-wide -- matches the web app's mandatory RTL/AR UX.
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
