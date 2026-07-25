import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:tayyibt/features/notifications/domain/use_cases/register_device_token_use_case.dart';
import 'package:tayyibt/features/notifications/services/push_notification_service.dart';

class MockNotificationsRepository extends Mock implements NotificationsRepository {}

void main() {
  late MockNotificationsRepository repository;

  setUp(() {
    repository = MockNotificationsRepository();
  });

  test('registerToken sends the resolved platform to the backend', () async {
    when(() => repository.registerDeviceToken('tok-1', 'ios')).thenAnswer((_) async {});
    final service = PushNotificationService(
      RegisterDeviceTokenUseCase(repository),
      platformResolver: () => 'ios',
    );

    await service.registerToken('tok-1');

    verify(() => repository.registerDeviceToken('tok-1', 'ios')).called(1);
  });

  test('registerToken works for android too', () async {
    when(() => repository.registerDeviceToken('tok-2', 'android')).thenAnswer((_) async {});
    final service = PushNotificationService(
      RegisterDeviceTokenUseCase(repository),
      platformResolver: () => 'android',
    );

    await service.registerToken('tok-2');

    verify(() => repository.registerDeviceToken('tok-2', 'android')).called(1);
  });
}
