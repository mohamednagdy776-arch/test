// GET /saved/collections's live shape (backend/src/memories/entities/
// saved-collection.entity.ts).
class SavedCollection {
  final String id;
  final String name;
  final String? coverImage;
  final DateTime createdAt;

  const SavedCollection({
    required this.id,
    required this.name,
    this.coverImage,
    required this.createdAt,
  });

  factory SavedCollection.fromJson(Map<String, dynamic> json) {
    return SavedCollection(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      coverImage: json['coverImage'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
