import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/notifications/domain/entities/notification.dart';
import 'package:tayyibt/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:tayyibt/features/notifications/domain/use_cases/notifications_use_case.dart';
import 'package:tayyibt/features/notifications/presentation/state/notifications_notifier.dart';

class MockNotificationsRepository extends Mock implements NotificationsRepository {}

AppNotification _notification(String id, {bool readStatus = false}) {
  return AppNotification(
    id: id,
    type: 'like',
    message: 'أعجب أحدهم بمنشورك',
    readStatus: readStatus,
    createdAt: DateTime(2026, 1, 1),
  );
}

void main() {
  late MockNotificationsRepository repository;
  late NotificationsNotifier notifier;

  setUp(() {
    repository = MockNotificationsRepository();
    notifier = NotificationsNotifier(NotificationsUseCase(repository));
  });

  test('load populates items from the repository', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(
        items: [_notification('1'), _notification('2')],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      ),
    );

    await notifier.load();

    expect(notifier.state.items.map((n) => n.id), ['1', '2']);
  });

  test('markAsRead optimistically flips readStatus and persists it', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.markAsRead('1')).thenAnswer((_) async {});

    await notifier.load();
    await notifier.markAsRead('1');

    expect(notifier.state.items.single.readStatus, isTrue);
    verify(() => repository.markAsRead('1')).called(1);
  });

  test('markAsRead reverts the optimistic update on failure', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.markAsRead('1')).thenThrow(Exception('network error'));

    await notifier.load();
    await notifier.markAsRead('1');

    expect(notifier.state.items.single.readStatus, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  test('markAllRead flips every item and persists it', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(
        items: [_notification('1'), _notification('2')],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      ),
    );
    when(() => repository.markAllRead()).thenAnswer((_) async {});

    await notifier.load();
    await notifier.markAllRead();

    expect(notifier.state.items.every((n) => n.readStatus), isTrue);
    verify(() => repository.markAllRead()).called(1);
  });
}
