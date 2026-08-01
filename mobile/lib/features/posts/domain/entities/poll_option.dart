// A single poll option, embedded on Post.pollOptions --
// backend/src/posts/entities/post.entity.ts's jsonb `poll_options` column.
//
// `voterIds` is ONLY present when the raw (unsanitized) entity leaks through:
// curl-verified live that GET /posts/:postId's sanitizePolls() call is
// skipped entirely when the viewer IS the post's own author
// (backend/src/posts/services/posts.service.ts:223 `if (post.userId ===
// viewerId) return post;` -- returns before the sanitizePolls() call at the
// bottom of findById()), so the owner's own fetch of their own poll post
// exposes raw voterIds and never gets a top-level `myVote`. Every other path
// (feed, non-owner findById, the vote response, the /poll/voters response)
// strips voterIds server-side and never sends it. Kept nullable here so the
// UI layer can use it as a fallback to compute the owner's own vote (see
// post_detail_screen.dart) instead of guessing at a fix for that backend gap.
class PollOption {
  final String text;
  final int votes;
  final List<String>? voterIds;

  const PollOption({required this.text, this.votes = 0, this.voterIds});

  factory PollOption.fromJson(Map<String, dynamic> json) {
    return PollOption(
      text: json['text'] as String? ?? '',
      // Curl-verified: creating a poll option without an explicit `votes: 0`
      // leaves the column NaN after the first vote (backend does `opt.votes
      // += 1` on an undefined value), which JSON.stringify serializes as
      // `null`. Coalesce defensively so the UI never renders "null%".
      votes: (json['votes'] as num?)?.toInt() ?? 0,
      voterIds: (json['voterIds'] as List<dynamic>?)?.cast<String>(),
    );
  }

  // Sent when creating/editing a poll -- always pins `votes: 0` explicitly to
  // avoid the NaN-on-first-vote bug described above.
  Map<String, dynamic> toCreateJson() => {'text': text, 'votes': 0};
}

// POST /posts/:id/poll/:optionIndex/vote's response shape (curl-verified):
// { success, pollOptions: [{text, votes}], myVote }. Always properly
// stripped of voterIds and always carries myVote, regardless of ownership --
// unlike GET /posts/:id, this endpoint's stripVoters() runs unconditionally.
class PollVoteResult {
  final List<PollOption> pollOptions;
  final int? myVote;

  const PollVoteResult({required this.pollOptions, this.myVote});

  factory PollVoteResult.fromJson(Map<String, dynamic> json) {
    return PollVoteResult(
      pollOptions: ((json['pollOptions'] as List<dynamic>?) ?? const [])
          .map((e) => PollOption.fromJson(e as Map<String, dynamic>))
          .toList(),
      myVote: json['myVote'] as int?,
    );
  }
}
