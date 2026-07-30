// Curl-verified against the live VPS across every sibling endpoint (GET
// /pages, /pages/my, /pages/created, /pages/search, /pages/suggested, POST
// /pages, GET /pages/:id, PATCH /pages/:id, GET /pages/username/:username):
// all return the base fields + followerCount/likeCount, but the
// isFollowing/isLiked/isOwner trio is only present on GET /pages/:id and GET
// /pages/username/:username (findOne()); /pages and /pages/search also add
// an `ownerId` (createdBy?.id) that findOne doesn't. Every extra field is
// therefore nullable and simply absent outside its originating endpoint.
class Page {
  final String id;
  final String username;
  final String name;
  final String? description;
  final String? category;
  final String privacy; // public | private
  final String? profilePhoto;
  final String? coverPhoto;
  final String? website;
  final String? contactInfo;
  final String? location;
  final String? hours;
  final bool isVerified;
  final int followerCount;
  final int likeCount;
  final bool? isFollowing;
  final bool? isLiked;
  final bool? isOwner;
  final String? ownerId;

  const Page({
    required this.id,
    required this.username,
    required this.name,
    this.description,
    this.category,
    this.privacy = 'public',
    this.profilePhoto,
    this.coverPhoto,
    this.website,
    this.contactInfo,
    this.location,
    this.hours,
    this.isVerified = false,
    this.followerCount = 0,
    this.likeCount = 0,
    this.isFollowing,
    this.isLiked,
    this.isOwner,
    this.ownerId,
  });

  factory Page.fromJson(Map<String, dynamic> json) {
    return Page(
      id: json['id'] as String,
      username: json['username'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      privacy: json['privacy'] as String? ?? 'public',
      profilePhoto: json['profilePhoto'] as String?,
      coverPhoto: json['coverPhoto'] as String?,
      website: json['website'] as String?,
      contactInfo: json['contactInfo'] as String?,
      location: json['location'] as String?,
      hours: json['hours'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      followerCount: json['followerCount'] as int? ?? 0,
      likeCount: json['likeCount'] as int? ?? 0,
      isFollowing: json['isFollowing'] as bool?,
      isLiked: json['isLiked'] as bool?,
      isOwner: json['isOwner'] as bool?,
      ownerId: json['ownerId'] as String?,
    );
  }
}
