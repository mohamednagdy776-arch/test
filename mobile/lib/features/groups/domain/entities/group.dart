// Replaces the earlier bare stub. Curl-verified against the live VPS across
// several sibling endpoints that all return *different* subsets of this
// shape: GET /groups, /groups/public, /groups/my, /groups/suggested all
// return the base fields + memberCount but never createdBy; POST /groups
// (create) additionally returns a hydrated createdBy user object nobody else
// does; GET /groups/:id adds isMember/role/isAdmin; POST /groups/:id/join
// adds joinStatus instead. All the extra fields are therefore nullable and
// simply absent outside their originating endpoint. createdBy itself isn't
// modeled -- nothing in this phase's UI needs to display the creator.
class Group {
  final String id;
  final String name;
  final String? description;
  final String privacy; // public | private | secret
  final String? category;
  final String? coverPhoto;
  final String? location;
  final int memberCount;
  final DateTime? createdAt;
  final bool? isMember;
  final bool? isAdmin;
  final String? role;
  final String? joinStatus; // 'active' | 'pending' -- only on the join response

  const Group({
    required this.id,
    required this.name,
    this.description,
    required this.privacy,
    this.category,
    this.coverPhoto,
    this.location,
    this.memberCount = 0,
    this.createdAt,
    this.isMember,
    this.isAdmin,
    this.role,
    this.joinStatus,
  });

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      privacy: json['privacy'] as String? ?? 'public',
      category: json['category'] as String?,
      coverPhoto: json['coverPhoto'] as String?,
      location: json['location'] as String?,
      memberCount: json['memberCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      isMember: json['isMember'] as bool?,
      isAdmin: json['isAdmin'] as bool?,
      role: json['role'] as String?,
      joinStatus: json['joinStatus'] as String?,
    );
  }
}
