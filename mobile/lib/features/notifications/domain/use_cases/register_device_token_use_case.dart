import '../repositories/notifications_repository.dart';

// Fired from the auth flow (login/register success), not the notifications
// screen -- kept separate from NotificationsUseCase since it's consumed by
// a completely different part of the app (PushNotificationService).
class RegisterDeviceTokenUseCase {
  final NotificationsRepository _repository;
  const RegisterDeviceTokenUseCase(this._repository);

  Future<void> call(String token, String platform) => _repository.registerDeviceToken(token, platform);
}
