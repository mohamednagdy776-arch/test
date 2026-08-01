import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/notifications/domain/entities/notification.dart';
import 'package:tayyibt/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:tayyibt/features/notifications/domain/use_cases/notifications_use_case.dart';
import 'package:tayyibt/features/notifications/presentation/state/notifications_notifier.dart';
import 'package:tayyibt/features/notifications/presentation/state/notifications_state.dart';

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

  test('filteredItems on the Unread tab hides already-read notifications', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(
        items: [_notification('1', readStatus: true), _notification('2')],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      ),
    );

    await notifier.load();
    await notifier.setTab(NotificationTab.unread);

    expect(notifier.state.activeTab, NotificationTab.unread);
    expect(notifier.state.filteredItems.map((n) => n.id), ['2']);
    // All<->Unread is a client-side filter over the same base list -- no refetch.
    verify(() => repository.getNotifications(page: 1, limit: 20, type: null)).called(1);
  });

  test('setTab(likes) refetches with the server-side type filter', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getNotifications(page: 1, limit: 20, type: 'like')).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('2')], total: 1, page: 1, limit: 20, totalPages: 1),
    );

    await notifier.load();
    await notifier.setTab(NotificationTab.likes);

    expect(notifier.state.activeTab, NotificationTab.likes);
    expect(notifier.state.items.map((n) => n.id), ['2']);
    verify(() => repository.getNotifications(page: 1, limit: 20, type: 'like')).called(1);
  });

  test('setTab is a no-op when selecting the already-active tab', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );

    await notifier.load();
    await notifier.setTab(NotificationTab.all);

    verify(() => repository.getNotifications(page: 1, limit: 20, type: null)).called(1);
  });

  test('loadMore appends the next page and stops when the server has no more', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 2, page: 1, limit: 1, totalPages: 2),
    );
    when(() => repository.getNotifications(page: 2, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('2')], total: 2, page: 2, limit: 1, totalPages: 2),
    );

    await notifier.load();
    expect(notifier.state.hasMore, isTrue);

    await notifier.loadMore();

    expect(notifier.state.items.map((n) => n.id), ['1', '2']);
    expect(notifier.state.hasMore, isFalse);
  });

  test('loadMore does nothing when hasMore is false', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );

    await notifier.load();
    await notifier.loadMore();

    verifyNever(() => repository.getNotifications(page: 2, limit: any(named: 'limit'), type: any(named: 'type')));
  });

  test('delete optimistically removes the notification and persists it', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(
        items: [_notification('1'), _notification('2')],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      ),
    );
    when(() => repository.deleteNotification('1')).thenAnswer((_) async {});

    await notifier.load();
    await notifier.delete('1');

    expect(notifier.state.items.map((n) => n.id), ['2']);
    verify(() => repository.deleteNotification('1')).called(1);
  });

  test('delete reverts the optimistic removal on failure', () async {
    when(() => repository.getNotifications(page: 1, limit: 20, type: null)).thenAnswer(
      (_) async => PaginatedResult(items: [_notification('1')], total: 1, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.deleteNotification('1')).thenThrow(Exception('network error'));

    await notifier.load();
    await notifier.delete('1');

    expect(notifier.state.items.map((n) => n.id), ['1']);
    expect(notifier.state.error, isNotNull);
  });
}
