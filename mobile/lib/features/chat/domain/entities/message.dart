// Matches GET /chat/conversations/:id/messages's actual item shape and the
// Socket.IO newMessage payload (curl + gateway-source verified) -- no
// matchId (that was never a real field), no server-sent isOwn (computed
// client-side by comparing senderId against the current user).
class Message {
  final String id;
  final String content;
  final String senderId;
  final String? senderName;
  final String type;
  final String? mediaUrl;
  final String? replyToId;
  final bool isEdited;
  final DateTime createdAt;

  const Message({
    required this.id,
    required this.content,
    required this.senderId,
    this.senderName,
    this.type = 'text',
    this.mediaUrl,
    this.replyToId,
    this.isEdited = false,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      content: json['content'] as String? ?? '',
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String?,
      type: json['type'] as String? ?? 'text',
      mediaUrl: json['mediaUrl'] as String?,
      replyToId: json['replyToId'] as String?,
      isEdited: json['isEdited'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
