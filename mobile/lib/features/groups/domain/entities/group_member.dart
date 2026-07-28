// GET /groups/:id/members -- curl-verified: { data: { data: [...], total } },
// i.e. after ApiResponse.unwrap() this is a *second* nested `data` list plus
// `total` with no page/limit/totalPages (doesn't go through the shared
// paginated() helper the way most list endpoints do).
class GroupMember {
  final String id; // user id
  final String? username;
  final String fullName;
  final String role; // 'admin' | 'member'
  final bool isBanned;
  final String status; // 'active' | 'pending'
  final DateTime? joinedAt;

  const GroupMember({
    required this.id,
    this.username,
    required this.fullName,
    required this.role,
    this.isBanned = false,
    required this.status,
    this.joinedAt,
  });

  factory GroupMember.fromJson(Map<String, dynamic> json) {
    return GroupMember(
      id: json['id'] as String,
      username: json['username'] as String?,
      fullName: json['fullName'] as String? ?? 'مستخدم',
      role: json['role'] as String? ?? 'member',
      isBanned: json['isBanned'] as bool? ?? false,
      status: json['status'] as String? ?? 'active',
      joinedAt: json['joinedAt'] != null ? DateTime.tryParse(json['joinedAt'] as String) : null,
    );
  }
}

class GroupMembersPage {
  final List<GroupMember> items;
  final int total;
  const GroupMembersPage({required this.items, required this.total});
}
