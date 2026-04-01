class Message {
  final String id;
  final String matchId;
  final String senderId;
  final String? senderName;
  final String content;
  final String type;
  final bool isOwn;
  final DateTime createdAt;

  const Message({
    required this.id,
    required this.matchId,
    required this.senderId,
    this.senderName,
    required this.content,
    required this.type,
    required this.isOwn,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      matchId: json['matchId'] as String? ?? '',
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String?,
      content: json['content'] as String,
      type: json['type'] as String? ?? 'text',
      isOwn: json['isOwn'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
