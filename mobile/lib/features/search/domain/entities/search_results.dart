import '../../../groups/domain/entities/group.dart';
import '../../../posts/domain/entities/post.dart';
import 'search_user.dart';

// GET /search -- curl-verified: { users: [...], posts: [...], groups: [...],
// pages: [...], events: [...] }, always all five keys regardless of
// `category` filter (unselected categories just come back empty). pages/
// events are intentionally not modeled -- neither is a mobile feature in
// this phase (out of scope), so those two arrays are dropped on parse.
class SearchResults {
  final List<SearchUser> users;
  final List<Group> groups;
  final List<Post> posts;

  const SearchResults({this.users = const [], this.groups = const [], this.posts = const []});

  factory SearchResults.fromJson(Map<String, dynamic> json) {
    return SearchResults(
      users: ((json['users'] as List<dynamic>?) ?? const [])
          .map((e) => SearchUser.fromJson(e as Map<String, dynamic>))
          .toList(),
      groups: ((json['groups'] as List<dynamic>?) ?? const [])
          .map((e) => Group.fromJson(e as Map<String, dynamic>))
          .toList(),
      posts: ((json['posts'] as List<dynamic>?) ?? const [])
          .map((e) => Post.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
