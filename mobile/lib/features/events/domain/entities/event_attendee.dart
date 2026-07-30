// GET /events/:id/attendees?status=going|interested|not_going -- curl-verified:
// [{ id, username, fullName, rsvpedAt }], a projection of the user, not a
// full user object.
class EventAttendee {
  final String id;
  final String username;
  final String fullName;
  final DateTime rsvpedAt;

  const EventAttendee({
    required this.id,
    required this.username,
    required this.fullName,
    required this.rsvpedAt,
  });

  factory EventAttendee.fromJson(Map<String, dynamic> json) {
    return EventAttendee(
      id: json['id'] as String,
      username: json['username'] as String,
      fullName: json['fullName'] as String,
      rsvpedAt: DateTime.parse(json['rsvpedAt'] as String),
    );
  }
}
