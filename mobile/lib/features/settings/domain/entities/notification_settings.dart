// Mirrors backend/src/settings/dto/update-notifications.dto.ts (in-app
// notification categories + master switch). Distinct from
// features/notifications/domain/entities/notification_preferences.dart,
// which controls PUSH categories via a completely different backend module
// (notifications.controller.ts's /notifications/preferences).
class NotificationSettings {
  final bool notificationsEnabled;
  final bool likesNotifications;
  final bool commentsNotifications;
  final bool friendRequestsNotifications;
  final bool messagesNotifications;
  final bool mentionsNotifications;
  final bool emailNotifications;
  final bool pushNotifications;
  final bool smsNotifications;

  const NotificationSettings({
    this.notificationsEnabled = true,
    this.likesNotifications = true,
    this.commentsNotifications = true,
    this.friendRequestsNotifications = true,
    this.messagesNotifications = true,
    this.mentionsNotifications = true,
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.smsNotifications = false,
  });

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      notificationsEnabled: json['notificationsEnabled'] as bool? ?? true,
      likesNotifications: json['likesNotifications'] as bool? ?? true,
      commentsNotifications: json['commentsNotifications'] as bool? ?? true,
      friendRequestsNotifications: json['friendRequestsNotifications'] as bool? ?? true,
      messagesNotifications: json['messagesNotifications'] as bool? ?? true,
      mentionsNotifications: json['mentionsNotifications'] as bool? ?? true,
      emailNotifications: json['emailNotifications'] as bool? ?? true,
      pushNotifications: json['pushNotifications'] as bool? ?? true,
      smsNotifications: json['smsNotifications'] as bool? ?? false,
    );
  }

  NotificationSettings copyWith({
    bool? notificationsEnabled,
    bool? likesNotifications,
    bool? commentsNotifications,
    bool? friendRequestsNotifications,
    bool? messagesNotifications,
    bool? mentionsNotifications,
  }) {
    return NotificationSettings(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      likesNotifications: likesNotifications ?? this.likesNotifications,
      commentsNotifications: commentsNotifications ?? this.commentsNotifications,
      friendRequestsNotifications: friendRequestsNotifications ?? this.friendRequestsNotifications,
      messagesNotifications: messagesNotifications ?? this.messagesNotifications,
      mentionsNotifications: mentionsNotifications ?? this.mentionsNotifications,
      emailNotifications: emailNotifications,
      pushNotifications: pushNotifications,
      smsNotifications: smsNotifications,
    );
  }
}

class NewsletterSettings {
  final bool newsletterEnabled;
  final bool weeklyDigest;
  final bool newFeaturesUpdates;
  final bool promotionsOffers;
  final bool eventsAndCommunities;
  final bool securityAlerts;

  const NewsletterSettings({
    this.newsletterEnabled = true,
    this.weeklyDigest = true,
    this.newFeaturesUpdates = true,
    this.promotionsOffers = false,
    this.eventsAndCommunities = true,
    this.securityAlerts = true,
  });

  factory NewsletterSettings.fromJson(Map<String, dynamic> json) {
    return NewsletterSettings(
      newsletterEnabled: json['newsletterEnabled'] as bool? ?? true,
      weeklyDigest: json['weeklyDigest'] as bool? ?? true,
      newFeaturesUpdates: json['newFeaturesUpdates'] as bool? ?? true,
      promotionsOffers: json['promotionsOffers'] as bool? ?? false,
      eventsAndCommunities: json['eventsAndCommunities'] as bool? ?? true,
      securityAlerts: json['securityAlerts'] as bool? ?? true,
    );
  }

  NewsletterSettings copyWith({
    bool? newsletterEnabled,
    bool? weeklyDigest,
    bool? newFeaturesUpdates,
    bool? promotionsOffers,
    bool? eventsAndCommunities,
    bool? securityAlerts,
  }) {
    return NewsletterSettings(
      newsletterEnabled: newsletterEnabled ?? this.newsletterEnabled,
      weeklyDigest: weeklyDigest ?? this.weeklyDigest,
      newFeaturesUpdates: newFeaturesUpdates ?? this.newFeaturesUpdates,
      promotionsOffers: promotionsOffers ?? this.promotionsOffers,
      eventsAndCommunities: eventsAndCommunities ?? this.eventsAndCommunities,
      securityAlerts: securityAlerts ?? this.securityAlerts,
    );
  }
}
