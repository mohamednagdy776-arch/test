import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/use_cases/notifications_settings_use_case.dart';
import 'notifications_settings_state.dart';

class NotificationsSettingsNotifier extends StateNotifier<NotificationsSettingsState> {
  final NotificationsSettingsUseCase _useCase;
  NotificationsSettingsNotifier(this._useCase) : super(const NotificationsSettingsState());

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final notifications = await _useCase.getNotificationSettings();
      final newsletter = await _useCase.getNewsletterSettings();
      state = state.copyWith(
        notificationSettings: notifications,
        newsletterSettings: newsletter,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'تعذّر تحميل إعدادات الإشعارات');
    }
  }

  Future<bool> updateNotificationField(String key, bool value) async {
    try {
      final updated = await _useCase.updateNotificationSettings({key: value});
      state = state.copyWith(notificationSettings: updated, error: state.error);
      return true;
    } catch (_) {
      state = state.copyWith(error: 'فشل في حفظ الإعدادات');
      return false;
    }
  }

  Future<bool> updateNewsletterField(String key, bool value) async {
    try {
      final updated = await _useCase.updateNewsletterSettings({key: value});
      state = state.copyWith(newsletterSettings: updated, error: state.error);
      return true;
    } catch (_) {
      state = state.copyWith(error: 'فشل في حفظ الإعدادات');
      return false;
    }
  }
}
