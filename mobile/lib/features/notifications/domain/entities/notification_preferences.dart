// Mirrors backend/src/notifications/entities/notification-preference.entity.ts.
class NotificationPreferences {
  final bool newMatch;
  final bool newMessage;
  final bool postReaction;
  final bool postComment;
  final bool medicalResultReady;
  final bool consentRequest;
  final bool subscriptionEvents;
  final bool labResultSubmitted;
  final bool systemAnnouncements;

  const NotificationPreferences({
    this.newMatch = true,
    this.newMessage = true,
    this.postReaction = true,
    this.postComment = true,
    this.medicalResultReady = true,
    this.consentRequest = true,
    this.subscriptionEvents = true,
    this.labResultSubmitted = true,
    this.systemAnnouncements = true,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      newMatch: json['newMatch'] as bool? ?? true,
      newMessage: json['newMessage'] as bool? ?? true,
      postReaction: json['postReaction'] as bool? ?? true,
      postComment: json['postComment'] as bool? ?? true,
      medicalResultReady: json['medicalResultReady'] as bool? ?? true,
      consentRequest: json['consentRequest'] as bool? ?? true,
      subscriptionEvents: json['subscriptionEvents'] as bool? ?? true,
      labResultSubmitted: json['labResultSubmitted'] as bool? ?? true,
      systemAnnouncements: json['systemAnnouncements'] as bool? ?? true,
    );
  }

  Map<String, bool> toMap() => {
        'newMatch': newMatch,
        'newMessage': newMessage,
        'postReaction': postReaction,
        'postComment': postComment,
        'medicalResultReady': medicalResultReady,
        'consentRequest': consentRequest,
        'subscriptionEvents': subscriptionEvents,
        'labResultSubmitted': labResultSubmitted,
        'systemAnnouncements': systemAnnouncements,
      };
}
