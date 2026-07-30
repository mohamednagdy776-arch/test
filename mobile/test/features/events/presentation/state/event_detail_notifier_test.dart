import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:tayyibt/features/events/domain/entities/event.dart';
import 'package:tayyibt/features/events/domain/entities/event_attendee.dart';
import 'package:tayyibt/features/events/domain/repositories/events_repository.dart';
import 'package:tayyibt/features/events/domain/use_cases/event_detail_use_case.dart';
import 'package:tayyibt/features/events/domain/use_cases/manage_event_use_case.dart';
import 'package:tayyibt/features/events/presentation/state/event_detail_notifier.dart';

class MockEventsRepository extends Mock implements EventsRepository {}

Event _event({String? userRsvp, bool? isOwner}) => Event(
      id: 'e1',
      title: 'Test Event',
      startDate: DateTime(2026, 12, 1),
      userRsvp: userRsvp,
      isOwner: isOwner,
    );

void main() {
  late MockEventsRepository repository;
  late EventDetailNotifier notifier;

  setUp(() {
    repository = MockEventsRepository();
    notifier = EventDetailNotifier('e1', EventDetailUseCase(repository), ManageEventUseCase(repository));
  });

  test('load populates the event and default (going) attendees', () async {
    when(() => repository.getEvent('e1')).thenAnswer((_) async => _event());
    when(() => repository.getAttendees('e1', status: 'going')).thenAnswer(
      (_) async => [EventAttendee(id: 'u1', username: 'amina', fullName: 'Amina', rsvpedAt: DateTime(2026, 1, 1))],
    );

    await notifier.load();

    expect(notifier.state.event?.id, 'e1');
    expect(notifier.state.attendees.single.fullName, 'Amina');
    expect(notifier.state.isLoading, isFalse);
  });

  test('load sets an error when the repository throws', () async {
    when(() => repository.getEvent('e1')).thenThrow(Exception('not found'));

    await notifier.load();

    expect(notifier.state.error, isNotNull);
    expect(notifier.state.event, isNull);
  });

  test('rsvp reloads the event (RSVP response itself has no refreshed counts)', () async {
    when(() => repository.getEvent('e1')).thenAnswer((_) async => _event(userRsvp: 'going'));
    when(() => repository.getAttendees('e1', status: 'going')).thenAnswer((_) async => []);
    when(() => repository.rsvp('e1', 'going')).thenAnswer((_) async => _event());

    await notifier.rsvp('going');

    expect(notifier.state.event?.userRsvp, 'going');
    expect(notifier.state.isRsvping, isFalse);
    verify(() => repository.rsvp('e1', 'going')).called(1);
  });

  test('loadAttendees switches the active status tab', () async {
    when(() => repository.getAttendees('e1', status: 'interested')).thenAnswer(
      (_) async => [EventAttendee(id: 'u2', username: 'sara', fullName: 'Sara', rsvpedAt: DateTime(2026, 1, 2))],
    );

    await notifier.loadAttendees('interested');

    expect(notifier.state.attendeesStatus, 'interested');
    expect(notifier.state.attendees.single.username, 'sara');
    expect(notifier.state.isLoadingAttendees, isFalse);
  });
}
