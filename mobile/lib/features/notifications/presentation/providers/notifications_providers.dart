import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/notifications_remote_data_source.dart';
import '../../data/repositories/notifications_repository_impl.dart';
import '../../domain/entities/notification_preferences.dart';
import '../../domain/repositories/notifications_repository.dart';
import '../../domain/use_cases/notifications_use_case.dart';
import '../../domain/use_cases/register_device_token_use_case.dart';
import '../../services/push_notification_service.dart';
import '../state/notifications_notifier.dart';
import '../state/notifications_state.dart';
import '../../../../core/api/dio_client.dart';

final notificationsRemoteDataSourceProvider = Provider((ref) {
  return NotificationsRemoteDataSource(DioClient.create());
});

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  return NotificationsRepositoryImpl(ref.read(notificationsRemoteDataSourceProvider));
});

final notificationsUseCaseProvider = Provider((ref) {
  return NotificationsUseCase(ref.read(notificationsRepositoryProvider));
});

final registerDeviceTokenUseCaseProvider = Provider((ref) {
  return RegisterDeviceTokenUseCase(ref.read(notificationsRepositoryProvider));
});

final pushNotificationServiceProvider = Provider((ref) {
  return PushNotificationService(ref.read(registerDeviceTokenUseCaseProvider));
});

final notificationsProvider = StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  return NotificationsNotifier(ref.read(notificationsUseCaseProvider));
});

final unreadCountProvider = FutureProvider<int>((ref) {
  return ref.read(notificationsUseCaseProvider).getUnreadCount();
});

final notificationPreferencesProvider = FutureProvider<NotificationPreferences>((ref) {
  return ref.read(notificationsUseCaseProvider).getPreferences();
});
