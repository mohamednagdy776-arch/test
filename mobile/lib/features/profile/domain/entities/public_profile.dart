import '../../../friends/domain/entities/friendship_status.dart';

// GET /users/:idOrUsername's full authenticated response (curl-verified live
// against the VPS, two throwaway accounts) -- backend/src/users/controllers/
// users.controller.ts's getFullProfile(), NOT public-profile.controller.ts's
// unauthenticated `public/profile/:idOrUsername` (that one is a deliberately
// thin OG-preview endpoint for social crawlers, and NOT
// `:id/profile`/getPublicProfile either, which skips block-enforcement,
// profile-view recording, and the embedded friendshipStatus this screen
// needs). isSelf/friendshipStatus/mutualFriends/friendCount/photoLocked only
// make sense relative to the current viewer -- the backend computes them
// per-request, not stored fields.
class PublicProfile {
  final String id;
  final String userId;
  final String? username;
  final String fullName;
  final int? age;
  final String? gender;
  final String? country;
  final String? city;
  final String? socialStatus;
  final int childrenCount;
  final String? bio;
  final String? avatarUrl;
  final String? coverUrl;
  final String? website;
  final String? relationshipStatus;
  final String? location;
  final String? workplace;
  final String? education;
  final String? jobTitle;
  final String? financialLevel;
  final String? culturalLevel;
  final String? lifestyle;
  final String? sect;
  final String? prayerLevel;
  final String? religiousCommitment;
  final List<WorkEntry> workEntries;
  final List<EducationEntry> educationEntries;

  final bool isHealthVerified;
  final bool isIdentityVerified;
  final bool photoLocked;
  final int mutualFriends;
  final int friendCount;
  final bool isSelf;
  final DateTime? joinDate;
  final FriendshipStatus? friendshipStatus;

  const PublicProfile({
    required this.id,
    required this.userId,
    this.username,
    required this.fullName,
    this.age,
    this.gender,
    this.country,
    this.city,
    this.socialStatus,
    this.childrenCount = 0,
    this.bio,
    this.avatarUrl,
    this.coverUrl,
    this.website,
    this.relationshipStatus,
    this.location,
    this.workplace,
    this.education,
    this.jobTitle,
    this.financialLevel,
    this.culturalLevel,
    this.lifestyle,
    this.sect,
    this.prayerLevel,
    this.religiousCommitment,
    this.workEntries = const [],
    this.educationEntries = const [],
    this.isHealthVerified = false,
    this.isIdentityVerified = false,
    this.photoLocked = false,
    this.mutualFriends = 0,
    this.friendCount = 0,
    this.isSelf = false,
    this.joinDate,
    this.friendshipStatus,
  });

  factory PublicProfile.fromJson(Map<String, dynamic> json) {
    // fullName can come back as an empty string (profile row exists but was
    // never filled in) -- fall back to first/last name, then a placeholder,
    // same fallback chain FriendUser/Post use elsewhere in the app.
    final firstLast = '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim();
    final rawFullName = json['fullName'] as String?;
    final friendshipStatusJson = json['friendshipStatus'] as Map<String, dynamic>?;
    return PublicProfile(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      username: json['username'] as String?,
      fullName: (rawFullName != null && rawFullName.trim().isNotEmpty)
          ? rawFullName
          : (firstLast.isNotEmpty ? firstLast : 'مستخدم'),
      age: json['age'] as int?,
      gender: json['gender'] as String?,
      country: json['country'] as String?,
      city: json['city'] as String?,
      socialStatus: json['socialStatus'] as String?,
      childrenCount: json['childrenCount'] as int? ?? 0,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      website: json['website'] as String?,
      relationshipStatus: json['relationshipStatus'] as String?,
      location: json['location'] as String?,
      workplace: json['workplace'] as String?,
      education: json['education'] as String?,
      jobTitle: json['jobTitle'] as String?,
      financialLevel: json['financialLevel'] as String?,
      culturalLevel: json['culturalLevel'] as String?,
      lifestyle: json['lifestyle'] as String?,
      sect: json['sect'] as String?,
      prayerLevel: json['prayerLevel'] as String?,
      religiousCommitment: json['religiousCommitment'] as String?,
      workEntries: (json['workEntries'] as List<dynamic>?)
              ?.map((e) => WorkEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      educationEntries: (json['educationEntries'] as List<dynamic>?)
              ?.map((e) => EducationEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      isHealthVerified: json['isHealthVerified'] as bool? ?? false,
      isIdentityVerified: json['isIdentityVerified'] as bool? ?? false,
      photoLocked: json['photoLocked'] as bool? ?? false,
      mutualFriends: json['mutualFriends'] as int? ?? 0,
      friendCount: json['friendCount'] as int? ?? 0,
      isSelf: json['isSelf'] as bool? ?? false,
      joinDate: (json['joinDate'] ?? json['createdAt']) != null
          ? DateTime.tryParse((json['joinDate'] ?? json['createdAt']) as String)
          : null,
      friendshipStatus: friendshipStatusJson != null ? FriendshipStatus.fromJson(friendshipStatusJson) : null,
    );
  }
}

class WorkEntry {
  final String? company;
  final String? position;
  final String? startDate;
  final String? endDate;
  final bool isCurrent;

  const WorkEntry({this.company, this.position, this.startDate, this.endDate, this.isCurrent = false});

  factory WorkEntry.fromJson(Map<String, dynamic> json) => WorkEntry(
        company: json['company'] as String?,
        position: json['position'] as String?,
        startDate: json['startDate'] as String?,
        endDate: json['endDate'] as String?,
        isCurrent: json['isCurrent'] as bool? ?? false,
      );
}

class EducationEntry {
  final String? school;
  final String? degree;
  final String? startYear;
  final String? endYear;

  const EducationEntry({this.school, this.degree, this.startYear, this.endYear});

  factory EducationEntry.fromJson(Map<String, dynamic> json) => EducationEntry(
        school: json['school'] as String?,
        degree: json['degree'] as String?,
        startYear: json['startYear']?.toString(),
        endYear: json['endYear']?.toString(),
      );
}
