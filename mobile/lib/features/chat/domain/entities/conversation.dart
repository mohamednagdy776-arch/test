// Matches GET /chat/conversations's item shape (curl-verified).
class Conversation {
  final String id;
  final String? name;
  final String? avatar;
  final bool isGroup;
  final String? otherUserId;
  final String? otherUserName;
  final String? otherUserAvatar;
  final String? lastMessageContent;
  final String? lastMessageType;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final DateTime createdAt;

  const Conversation({
    required this.id,
    this.name,
    this.avatar,
    this.isGroup = false,
    this.otherUserId,
    this.otherUserName,
    this.otherUserAvatar,
    this.lastMessageContent,
    this.lastMessageType,
    this.lastMessageAt,
    this.unreadCount = 0,
    required this.createdAt,
  });

  String get displayName => name ?? otherUserName ?? 'محادثة';
  String? get displayAvatar => avatar ?? otherUserAvatar;

  factory Conversation.fromJson(Map<String, dynamic> json) {
    final lastMessage = json['lastMessage'] as Map<String, dynamic>?;
    return Conversation(
      id: json['id'] as String,
      name: json['name'] as String?,
      avatar: json['avatar'] as String?,
      isGroup: json['isGroup'] as bool? ?? false,
      otherUserId: json['otherUserId'] as String?,
      otherUserName: json['otherUserName'] as String?,
      otherUserAvatar: json['otherUserAvatar'] as String?,
      lastMessageContent: lastMessage?['content'] as String?,
      lastMessageType: lastMessage?['type'] as String?,
      lastMessageAt: lastMessage?['createdAt'] != null ? DateTime.parse(lastMessage!['createdAt'] as String) : null,
      unreadCount: json['unreadCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
