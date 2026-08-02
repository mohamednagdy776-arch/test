// Mirrors GET /friends/birthdays (curl-verified live) -- backend's
// getBirthdays() pre-computes the next-occurrence date and days-until, capped
// to the next 30 days and sorted ascending, so the client just renders it.
class FriendBirthday {
  final String id;
  final String name;
  final DateTime date;
  final String? avatar;
  final int daysUntil;

  const FriendBirthday({
    required this.id,
    required this.name,
    required this.date,
    this.avatar,
    required this.daysUntil,
  });

  factory FriendBirthday.fromJson(Map<String, dynamic> json) {
    return FriendBirthday(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'مستخدم',
      date: DateTime.tryParse(json['date'] as String? ?? '') ?? DateTime.now(),
      avatar: json['avatar'] as String?,
      daysUntil: (json['daysUntil'] as num?)?.toInt() ?? 0,
    );
  }
}
