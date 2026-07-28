// GET /friends/status/:userId -- curl-verified: { status, id?, isRequester? }.
// status is one of 'none' | 'pending' | 'accepted' | 'blocked' (id/isRequester
// only present once a friendship/request row exists).
class FriendshipStatus {
  final String status;
  final String? requestId;
  final bool? isRequester;

  const FriendshipStatus({required this.status, this.requestId, this.isRequester});

  factory FriendshipStatus.fromJson(Map<String, dynamic> json) {
    return FriendshipStatus(
      status: json['status'] as String,
      requestId: json['id'] as String?,
      isRequester: json['isRequester'] as bool?,
    );
  }
}
