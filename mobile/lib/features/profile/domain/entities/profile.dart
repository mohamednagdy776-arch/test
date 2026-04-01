class Profile {
  final String id;
  final String? fullName;
  final String? gender;
  final int? age;
  final String? country;
  final String? city;
  final String? sect;
  final String? lifestyle;
  final String? education;
  final String? occupation;
  final String? bio;
  final String? avatar;
  final int? childrenCount;
  final String? prayerLevel;

  const Profile({
    required this.id,
    this.fullName,
    this.gender,
    this.age,
    this.country,
    this.city,
    this.sect,
    this.lifestyle,
    this.education,
    this.occupation,
    this.bio,
    this.avatar,
    this.childrenCount,
    this.prayerLevel,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      fullName: json['fullName'] as String?,
      gender: json['gender'] as String?,
      age: json['age'] as int?,
      country: json['country'] as String?,
      city: json['city'] as String?,
      sect: json['sect'] as String?,
      lifestyle: json['lifestyle'] as String?,
      education: json['education'] as String?,
      occupation: json['occupation'] as String?,
      bio: json['bio'] as String?,
      avatar: json['avatar'] as String?,
      childrenCount: json['childrenCount'] as int?,
      prayerLevel: json['prayerLevel'] as String?,
    );
  }
}
