import 'dart:io' show Platform;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../domain/use_cases/register_device_token_use_case.dart';

// FCM client wiring. Firebase.initializeApp() throws without a real Firebase
// project's config (no google-services.json / GoogleService-Info.plist exist
// yet -- a documented external prerequisite in the mobile build plan, not a
// bug). Every entry point here is wrapped so a missing/misconfigured Firebase
// project just means push doesn't register, rather than crashing the app --
// nothing to fix locally until that project exists.
class PushNotificationService {
  final RegisterDeviceTokenUseCase _registerDeviceToken;
  final String Function() _resolvePlatform;
  bool _refreshListenerAttached = false;

  PushNotificationService(this._registerDeviceToken, {String Function()? platformResolver})
      : _resolvePlatform = platformResolver ?? _defaultPlatform;

  static String _defaultPlatform() => Platform.isIOS ? 'ios' : 'android';

  Future<void> registerCurrentDevice() async {
    if (kIsWeb) return; // web push uses VAPID/service-worker, out of MVP scope
    try {
      await Firebase.initializeApp();
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();
      final token = await messaging.getToken();
      if (token != null) await registerToken(token);

      if (!_refreshListenerAttached) {
        _refreshListenerAttached = true;
        messaging.onTokenRefresh.listen(registerToken);
      }
    } catch (_) {
      // No Firebase project configured yet.
    }
  }

  Future<void> registerToken(String token) {
    return _registerDeviceToken(token, _resolvePlatform());
  }
}
