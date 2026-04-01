class Group {
  final String id;
  final String name;
  final String description;
  final String privacy;
  final String createdBy;
  final DateTime createdAt;

  const Group({
    required this.id,
    required this.name,
    required this.description,
    required this.privacy,
    required this.createdBy,
    required this.createdAt,
  });

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      privacy: json['privacy'] as String,
      createdBy: json['createdBy'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
