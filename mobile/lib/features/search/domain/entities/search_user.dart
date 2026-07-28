// GET /search?category=users (and the `users` array of a plain GET /search)
// -- curl-verified: a bespoke, already-flattened shape distinct from every
// other "user" shape in the app (friends/matching/chat each flatten
// differently). No nested profile object here -- avatarUrl/country/city/
// jobTitle/bio/sect/age/education/lifestyle/prayerLevel are already top-level.
class SearchUser {
  final String id;
  final String fullName;
  final String? username;
  final String? avatarUrl;
  final String? country;
  final String? city;
  final String? jobTitle;
  final String? bio;
  final int? age;

  const SearchUser({
    required this.id,
    required this.fullName,
    this.username,
    this.avatarUrl,
    this.country,
    this.city,
    this.jobTitle,
    this.bio,
    this.age,
  });

  factory SearchUser.fromJson(Map<String, dynamic> json) {
    return SearchUser(
      id: json['id'] as String,
      fullName: json['fullName'] as String? ?? 'مستخدم',
      username: json['username'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      country: json['country'] as String?,
      city: json['city'] as String?,
      jobTitle: json['jobTitle'] as String?,
      bio: json['bio'] as String?,
      age: json['age'] as int?,
    );
  }
}
