// GET /posts/:postId/poll/voters's per-option voter breakdown -- owner-only
// (backend/src/posts/services/stories.service.ts's getPollVoters() throws
// ForbiddenException for any non-owner viewer). Curl-verified live shape:
// [{ text, votes, voters: [{ id, username, name, avatarUrl }] }].
class PollVoter {
  final String id;
  final String? username;
  final String name;
  final String? avatarUrl;

  const PollVoter({required this.id, this.username, required this.name, this.avatarUrl});

  factory PollVoter.fromJson(Map<String, dynamic> json) {
    return PollVoter(
      id: json['id'] as String,
      username: json['username'] as String?,
      name: json['name'] as String? ?? 'مستخدم',
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}

class PollVoterOption {
  final String text;
  final int votes;
  final List<PollVoter> voters;

  const PollVoterOption({required this.text, this.votes = 0, this.voters = const []});

  factory PollVoterOption.fromJson(Map<String, dynamic> json) {
    return PollVoterOption(
      text: json['text'] as String? ?? '',
      votes: (json['votes'] as num?)?.toInt() ?? 0,
      voters: ((json['voters'] as List<dynamic>?) ?? const [])
          .map((e) => PollVoter.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
