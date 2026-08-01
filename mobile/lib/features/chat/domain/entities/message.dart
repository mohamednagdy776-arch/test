// Matches GET /chat/conversations/:id/messages's actual item shape and the
// Socket.IO newMessage payload (curl + gateway-source verified) -- no
// matchId (that was never a real field), no server-sent isOwn (computed
// client-side by comparing senderId against the current user).
class MessageReaction {
  final String emoji;
  final String userId;
  const MessageReaction({required this.emoji, required this.userId});

  factory MessageReaction.fromJson(Map<String, dynamic> json) {
    return MessageReaction(
      emoji: json['emoji'] as String,
      userId: json['userId'] as String,
    );
  }
}

class Message {
  final String id;
  final String content;
  final String senderId;
  final String? senderName;
  final String type;
  final String? mediaUrl;
  final String? replyToId;
  final bool isEdited;
  // Soft-deleted "for everyone" (curl-verified: content comes back as `null`
  // and this flag `true`; the message row itself is NOT removed from the
  // list, unlike a plain "delete for me" which the backend currently -- per
  // chat.service.ts's deleteMessage -- soft-deletes via a *global*
  // @DeleteDateColumn, hiding it from every participant, not just the
  // deleter. That's the backend's real (if surprising) behaviour; this
  // client only mirrors it, matching web/ChatWindow.tsx's own handling.
  final bool isDeletedForEveryone;
  final List<MessageReaction> reactions;
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
    this.isDeletedForEveryone = false,
    this.reactions = const [],
    required this.createdAt,
  });

  Message copyWith({
    String? content,
    bool? isDeletedForEveryone,
    List<MessageReaction>? reactions,
  }) {
    return Message(
      id: id,
      content: content ?? this.content,
      senderId: senderId,
      senderName: senderName,
      type: type,
      mediaUrl: mediaUrl,
      replyToId: replyToId,
      isEdited: isEdited,
      isDeletedForEveryone: isDeletedForEveryone ?? this.isDeletedForEveryone,
      reactions: reactions ?? this.reactions,
      createdAt: createdAt,
    );
  }

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
      isDeletedForEveryone: json['isDeletedForEveryone'] as bool? ?? false,
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((r) => MessageReaction.fromJson(r as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
