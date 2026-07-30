import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/data_sources/events_remote_data_source.dart';
import '../../data/repositories/events_repository_impl.dart';
import '../../domain/repositories/events_repository.dart';
import '../../domain/use_cases/get_events_use_case.dart';
import '../../domain/use_cases/event_detail_use_case.dart';
import '../../domain/use_cases/manage_event_use_case.dart';
import '../state/events_list_notifier.dart';
import '../state/events_list_state.dart';
import '../state/event_detail_notifier.dart';
import '../state/event_detail_state.dart';
import '../../../../core/api/dio_client.dart';

final eventsRemoteDataSourceProvider = Provider((ref) {
  return EventsRemoteDataSource(DioClient.create());
});

final eventsRepositoryProvider = Provider<EventsRepository>((ref) {
  return EventsRepositoryImpl(ref.read(eventsRemoteDataSourceProvider));
});

final getEventsUseCaseProvider = Provider((ref) {
  return GetEventsUseCase(ref.read(eventsRepositoryProvider));
});

final eventDetailUseCaseProvider = Provider((ref) {
  return EventDetailUseCase(ref.read(eventsRepositoryProvider));
});

final manageEventUseCaseProvider = Provider((ref) {
  return ManageEventUseCase(ref.read(eventsRepositoryProvider));
});

final eventsListProvider = StateNotifierProvider<EventsListNotifier, EventsListState>((ref) {
  return EventsListNotifier(ref.read(getEventsUseCaseProvider), ref.read(manageEventUseCaseProvider));
});

final eventDetailProvider =
    StateNotifierProvider.family<EventDetailNotifier, EventDetailState, String>((ref, eventId) {
  return EventDetailNotifier(
    eventId,
    ref.read(eventDetailUseCaseProvider),
    ref.read(manageEventUseCaseProvider),
  );
});
