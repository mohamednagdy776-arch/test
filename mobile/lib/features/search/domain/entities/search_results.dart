import '../../../events/domain/entities/event.dart';
import '../../../groups/domain/entities/group.dart';
import '../../../posts/domain/entities/post.dart';
import 'search_page_result.dart';
import 'search_user.dart';

// GET /search -- curl-verified: { users: [...], posts: [...], groups: [...],
// pages: [...], events: [...] }, always all five keys regardless of
// `category` filter (unselected categories just come back empty).
// events reuses the events feature's Event.fromJson -- the search endpoint's
// event shape (id/title/description/startDate/location) is a strict subset of
// what GET /events returns, and every field Event.fromJson doesn't find is
// already nullable/defaulted there. pages does NOT reuse CommunityPage --
// search's page shape omits `username`, which CommunityPage.fromJson requires
// -- see SearchPageResult.
class SearchResults {
  final List<SearchUser> users;
  final List<Group> groups;
  final List<Post> posts;
  final List<SearchPageResult> pages;
  final List<Event> events;

  const SearchResults({
    this.users = const [],
    this.groups = const [],
    this.posts = const [],
    this.pages = const [],
    this.events = const [],
  });

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
      pages: ((json['pages'] as List<dynamic>?) ?? const [])
          .map((e) => SearchPageResult.fromJson(e as Map<String, dynamic>))
          .toList(),
      events: ((json['events'] as List<dynamic>?) ?? const [])
          .map((e) => Event.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
