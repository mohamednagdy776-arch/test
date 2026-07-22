class Profile {
  final String id;
  final String? userId;
  final String? username;
  final String? fullName;
  final String? gender;
  final int? age;
  final String? country;
  final String? city;
  final String? socialStatus;
  final int? childrenCount;
  final String? avatarUrl;
  final String? coverUrl;
  final String? bio;
  final String? education;
  final String? jobTitle;
  final String? financialLevel;
  final String? culturalLevel;
  final String? lifestyle;
  final String? sect;
  final String? prayerLevel;
  final String? religiousCommitment;

  // Extended profile (see backend/src/users/entities/profile.entity.ts) --
  // matches web/src/app/(main)/settings/extended-profile/page.tsx's fields.
  final String? healthStatus;
  final String? employmentType;
  final String? settleCountry;
  final String? quranMemorization;
  final String? mosqueAttendance;
  final String? insuranceType;
  final List<String> interests;
  final List<String> skills;

  const Profile({
    required this.id,
    this.userId,
    this.username,
    this.fullName,
    this.gender,
    this.age,
    this.country,
    this.city,
    this.socialStatus,
    this.childrenCount,
    this.avatarUrl,
    this.coverUrl,
    this.bio,
    this.education,
    this.jobTitle,
    this.financialLevel,
    this.culturalLevel,
    this.lifestyle,
    this.sect,
    this.prayerLevel,
    this.religiousCommitment,
    this.healthStatus,
    this.employmentType,
    this.settleCountry,
    this.quranMemorization,
    this.mosqueAttendance,
    this.insuranceType,
    this.interests = const [],
    this.skills = const [],
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      username: json['username'] as String?,
      fullName: json['fullName'] as String?,
      gender: json['gender'] as String?,
      age: json['age'] as int?,
      country: json['country'] as String?,
      city: json['city'] as String?,
      socialStatus: json['socialStatus'] as String?,
      childrenCount: json['childrenCount'] as int?,
      avatarUrl: json['avatarUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      bio: json['bio'] as String?,
      education: json['education'] as String?,
      jobTitle: json['jobTitle'] as String?,
      financialLevel: json['financialLevel'] as String?,
      culturalLevel: json['culturalLevel'] as String?,
      lifestyle: json['lifestyle'] as String?,
      sect: json['sect'] as String?,
      prayerLevel: json['prayerLevel'] as String?,
      religiousCommitment: json['religiousCommitment'] as String?,
      healthStatus: json['healthStatus'] as String?,
      employmentType: json['employmentType'] as String?,
      settleCountry: json['settleCountry'] as String?,
      quranMemorization: json['quranMemorization'] as String?,
      mosqueAttendance: json['mosqueAttendance'] as String?,
      insuranceType: json['insuranceType'] as String?,
      interests: (json['interests'] as List<dynamic>?)?.cast<String>() ?? const [],
      skills: (json['skills'] as List<dynamic>?)?.cast<String>() ?? const [],
    );
  }
}
