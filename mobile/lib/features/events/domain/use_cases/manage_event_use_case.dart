import 'package:image_picker/image_picker.dart';
import '../entities/event.dart';
import '../repositories/events_repository.dart';

class ManageEventUseCase {
  final EventsRepository _repository;
  const ManageEventUseCase(this._repository);

  Future<Event> create({
    required String title,
    String? description,
    required String startDate,
    String? endDate,
    String? location,
    String privacy = 'public',
    XFile? coverPhoto,
  }) =>
      _repository.createEvent(
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        location: location,
        privacy: privacy,
        coverPhoto: coverPhoto,
      );

  Future<Event> update(
    String id, {
    String? title,
    String? description,
    String? location,
    String? startDate,
    String? endDate,
    String? privacy,
    XFile? coverPhoto,
  }) =>
      _repository.updateEvent(
        id,
        title: title,
        description: description,
        location: location,
        startDate: startDate,
        endDate: endDate,
        privacy: privacy,
        coverPhoto: coverPhoto,
      );

  Future<Event> rsvp(String id, String status) => _repository.rsvp(id, status);
}
