import 'group.dart';

// GET /groups/search -- curl-verified: { joinedGroups: [...], otherGroups: [...] },
// a shape unique to this endpoint (not a flat array like /groups/public etc).
class GroupSearchResult {
  final List<Group> joinedGroups;
  final List<Group> otherGroups;

  const GroupSearchResult({required this.joinedGroups, required this.otherGroups});

  factory GroupSearchResult.fromJson(Map<String, dynamic> json) {
    return GroupSearchResult(
      joinedGroups: ((json['joinedGroups'] as List<dynamic>?) ?? const [])
          .map((e) => Group.fromJson(e as Map<String, dynamic>))
          .toList(),
      otherGroups: ((json['otherGroups'] as List<dynamic>?) ?? const [])
          .map((e) => Group.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
