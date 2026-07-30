// Mirrors backend/src/settings/dto/update-privacy.dto.ts +
// web/src/features/settings/api.ts's PrivacySettings.
class PrivacySettings {
  final String whoCanSeePosts;
  final String whoCanSeeFriends;
  final String whoCanSendFriendRequests;
  final String whoCanSeeProfilePicture;
  final String whoCanSeeCoverPhoto;
  final String whoCanSeeBio;
  final String whoCanTagMe;
  final String whoCanSendMessages;
  final String whoCanFollow;
  final bool allowSearchEngines;

  const PrivacySettings({
    this.whoCanSeePosts = 'friends',
    this.whoCanSeeFriends = 'friends',
    this.whoCanSendFriendRequests = 'friends',
    this.whoCanSeeProfilePicture = 'friends',
    this.whoCanSeeCoverPhoto = 'friends',
    this.whoCanSeeBio = 'friends',
    this.whoCanTagMe = 'friends',
    this.whoCanSendMessages = 'friends',
    this.whoCanFollow = 'friends',
    this.allowSearchEngines = false,
  });

  factory PrivacySettings.fromJson(Map<String, dynamic> json) {
    return PrivacySettings(
      whoCanSeePosts: json['whoCanSeePosts'] as String? ?? 'friends',
      whoCanSeeFriends: json['whoCanSeeFriends'] as String? ?? 'friends',
      whoCanSendFriendRequests: json['whoCanSendFriendRequests'] as String? ?? 'friends',
      whoCanSeeProfilePicture: json['whoCanSeeProfilePicture'] as String? ?? 'friends',
      whoCanSeeCoverPhoto: json['whoCanSeeCoverPhoto'] as String? ?? 'friends',
      whoCanSeeBio: json['whoCanSeeBio'] as String? ?? 'friends',
      whoCanTagMe: json['whoCanTagMe'] as String? ?? 'friends',
      whoCanSendMessages: json['whoCanSendMessages'] as String? ?? 'friends',
      whoCanFollow: json['whoCanFollow'] as String? ?? 'friends',
      allowSearchEngines: json['allowSearchEngines'] as bool? ?? false,
    );
  }

  PrivacySettings copyWith({
    String? whoCanSeePosts,
    String? whoCanSeeFriends,
    String? whoCanSendFriendRequests,
    String? whoCanSeeProfilePicture,
    String? whoCanSeeCoverPhoto,
    String? whoCanSeeBio,
    String? whoCanTagMe,
    String? whoCanSendMessages,
    String? whoCanFollow,
    bool? allowSearchEngines,
  }) {
    return PrivacySettings(
      whoCanSeePosts: whoCanSeePosts ?? this.whoCanSeePosts,
      whoCanSeeFriends: whoCanSeeFriends ?? this.whoCanSeeFriends,
      whoCanSendFriendRequests: whoCanSendFriendRequests ?? this.whoCanSendFriendRequests,
      whoCanSeeProfilePicture: whoCanSeeProfilePicture ?? this.whoCanSeeProfilePicture,
      whoCanSeeCoverPhoto: whoCanSeeCoverPhoto ?? this.whoCanSeeCoverPhoto,
      whoCanSeeBio: whoCanSeeBio ?? this.whoCanSeeBio,
      whoCanTagMe: whoCanTagMe ?? this.whoCanTagMe,
      whoCanSendMessages: whoCanSendMessages ?? this.whoCanSendMessages,
      whoCanFollow: whoCanFollow ?? this.whoCanFollow,
      allowSearchEngines: allowSearchEngines ?? this.allowSearchEngines,
    );
  }
}

const List<String> kFullVisibilityOptions = ['public', 'friends', 'friends_of_friends', 'only_me'];
const List<String> kNoOnlyMeVisibilityOptions = ['public', 'friends', 'friends_of_friends'];
const List<String> kNoFriendsOfFriendsVisibilityOptions = ['public', 'friends', 'only_me'];
