import 'friend_user.dart';

// Mirrors GET/POST/PATCH /friends/lists (curl-verified live). `members` only
// comes back hydrated on GET /friends/lists (backend's getFriendLists() joins
// memberIds -> full User rows, #260) -- POST and PATCH responses carry
// `memberIds` but no `members` array, so callers should refetch the list
// after create/update rather than trusting the mutation response's members.
class FriendListEntity {
  final String id;
  final String name;
  final String type;
  final List<String> memberIds;
  final List<FriendUser> members;

  const FriendListEntity({
    required this.id,
    required this.name,
    this.type = 'custom',
    this.memberIds = const [],
    this.members = const [],
  });

  factory FriendListEntity.fromJson(Map<String, dynamic> json) {
    return FriendListEntity(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? 'custom',
      memberIds: (json['memberIds'] as List<dynamic>?)?.cast<String>() ?? const [],
      members: (json['members'] as List<dynamic>?)
              ?.map((e) => FriendUser.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}
