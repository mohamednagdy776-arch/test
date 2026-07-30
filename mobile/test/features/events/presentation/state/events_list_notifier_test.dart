import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/core/api/api_response.dart';
import 'package:tayyibt/features/events/domain/entities/event.dart';
import 'package:tayyibt/features/events/domain/repositories/events_repository.dart';
import 'package:tayyibt/features/events/domain/use_cases/get_events_use_case.dart';
import 'package:tayyibt/features/events/domain/use_cases/manage_event_use_case.dart';
import 'package:tayyibt/features/events/presentation/state/events_list_notifier.dart';

class MockEventsRepository extends Mock implements EventsRepository {}

Event _event(String id, {String? userRsvp}) => Event(
      id: id,
      title: 'Event $id',
      startDate: DateTime(2026, 12, 1),
      userRsvp: userRsvp,
    );

void main() {
  late MockEventsRepository repository;
  late EventsListNotifier notifier;

  setUp(() {
    repository = MockEventsRepository();
    notifier = EventsListNotifier(GetEventsUseCase(repository), ManageEventUseCase(repository));
  });

  test('loadInitial populates events and myEvents', () async {
    when(() => repository.getEvents(page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_event('1'), _event('2')], total: 2, page: 1, limit: 20, totalPages: 1),
    );
    when(() => repository.getMyEvents()).thenAnswer((_) async => [_event('1', userRsvp: 'going')]);

    await notifier.loadInitial();

    expect(notifier.state.events.map((e) => e.id), ['1', '2']);
    expect(notifier.state.myEvents.single.userRsvp, 'going');
    expect(notifier.state.isLoading, isFalse);
    expect(notifier.state.hasMore, isFalse);
  });

  test('loadInitial sets an error when the repository throws', () async {
    when(() => repository.getEvents(page: 1, limit: 20)).thenThrow(Exception('network error'));

    await notifier.loadInitial();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.isLoading, isFalse);
  });

  test('loadMore merges the next page by id', () async {
    when(() => repository.getEvents(page: 1, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_event('1')], total: 2, page: 1, limit: 20, totalPages: 2),
    );
    when(() => repository.getMyEvents()).thenAnswer((_) async => []);
    await notifier.loadInitial();
    expect(notifier.state.hasMore, isTrue);

    when(() => repository.getEvents(page: 2, limit: 20)).thenAnswer(
      (_) async => PaginatedResult(items: [_event('2')], total: 2, page: 2, limit: 20, totalPages: 2),
    );
    await notifier.loadMore();

    expect(notifier.state.events.map((e) => e.id), ['1', '2']);
    expect(notifier.state.hasMore, isFalse);
  });

  test('rsvp calls the repository then reloads the lists', () async {
    when(() => repository.getEvents(page: 1, limit: 20)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getMyEvents()).thenAnswer((_) async => []);
    when(() => repository.rsvp('e1', 'going')).thenAnswer((_) async => _event('e1', userRsvp: 'going'));

    await notifier.rsvp('e1', 'going');

    verifyInOrder([
      () => repository.rsvp('e1', 'going'),
      () => repository.getEvents(page: 1, limit: 20),
    ]);
    expect(notifier.state.rsvpPendingIds, isEmpty);
  });

  test('rsvp sets an error and clears the pending id when the repository throws', () async {
    when(() => repository.rsvp('e1', 'going')).thenThrow(Exception('boom'));

    await notifier.rsvp('e1', 'going');

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.rsvpPendingIds, isEmpty);
  });

  test('create returns false and sets an error on failure', () async {
    when(() => repository.createEvent(
          title: 'x',
          description: null,
          startDate: '2026-12-01T00:00:00.000Z',
          endDate: null,
          location: null,
          privacy: 'public',
          coverPhoto: null,
        )).thenThrow(Exception('boom'));

    final ok = await notifier.create(title: 'x', startDate: '2026-12-01T00:00:00.000Z');

    expect(ok, isFalse);
    expect(notifier.state.error, isNotNull);
  });

  test('create returns true and reloads on success', () async {
    when(() => repository.createEvent(
          title: 'x',
          description: null,
          startDate: '2026-12-01T00:00:00.000Z',
          endDate: null,
          location: null,
          privacy: 'public',
          coverPhoto: null,
        )).thenAnswer((_) async => _event('new'));
    when(() => repository.getEvents(page: 1, limit: 20)).thenAnswer(
      (_) async => const PaginatedResult(items: [], total: 0, page: 1, limit: 20, totalPages: 0),
    );
    when(() => repository.getMyEvents()).thenAnswer((_) async => []);

    final ok = await notifier.create(title: 'x', startDate: '2026-12-01T00:00:00.000Z');

    expect(ok, isTrue);
    expect(notifier.state.isCreating, isFalse);
  });
}
