// Curl-verified against the live VPS: GET /events, /events/upcoming (an exact
// duplicate of /events -- eventsService.findAll() is called by both, so this
// client deliberately only wires up /events; see EventsRemoteDataSource),
// /events/my, POST /events, GET /events/:id, PATCH /events/:id, POST rsvp all
// return slightly different subsets of this shape:
//  - list/upcoming: base fields + goingCount/interestedCount/notGoingCount +
//    userRsvp, but no createdBy/isOwner at all (findAll() never joins it).
//  - /events/my: base fields + userRsvp only, no counts.
//  - POST create: base fields + a hydrated createdBy, no counts/isOwner.
//  - GET :id: base fields + counts + userRsvp + isOwner (the only endpoint
//    that has isOwner) + createdBy.
// Every extra field is therefore nullable and simply absent outside its
// originating endpoint.
class Event {
  final String id;
  final String title;
  final String? description;
  final DateTime startDate;
  final DateTime? endDate;
  final String? location;
  final String? coverPhoto;
  final String privacy; // public | friends | private
  final int goingCount;
  final int interestedCount;
  final int notGoingCount;
  final String? userRsvp; // 'going' | 'interested' | 'not_going' | null
  final bool? isOwner;

  const Event({
    required this.id,
    required this.title,
    this.description,
    required this.startDate,
    this.endDate,
    this.location,
    this.coverPhoto,
    this.privacy = 'public',
    this.goingCount = 0,
    this.interestedCount = 0,
    this.notGoingCount = 0,
    this.userRsvp,
    this.isOwner,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null ? DateTime.tryParse(json['endDate'] as String) : null,
      location: json['location'] as String?,
      coverPhoto: json['coverPhoto'] as String?,
      privacy: json['privacy'] as String? ?? 'public',
      goingCount: json['goingCount'] as int? ?? 0,
      interestedCount: json['interestedCount'] as int? ?? 0,
      notGoingCount: json['notGoingCount'] as int? ?? 0,
      userRsvp: json['userRsvp'] as String?,
      isOwner: json['isOwner'] as bool?,
    );
  }
}
