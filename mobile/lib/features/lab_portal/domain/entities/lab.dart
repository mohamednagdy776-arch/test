class Lab {
  final String id;
  final String name;
  final String? commercialRegistration;
  final String status;

  const Lab({
    required this.id,
    required this.name,
    this.commercialRegistration,
    required this.status,
  });

  factory Lab.fromJson(Map<String, dynamic> json) {
    return Lab(
      id: json['id'] as String,
      name: json['name'] as String,
      commercialRegistration: json['commercialRegistration'] as String?,
      status: json['status'] as String? ?? 'active',
    );
  }
}
