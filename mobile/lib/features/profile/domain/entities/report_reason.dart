// GET /reports/reasons -- curl-verified: [{ id, label }].
class ReportReason {
  final String id;
  final String label;
  const ReportReason({required this.id, required this.label});

  factory ReportReason.fromJson(Map<String, dynamic> json) => ReportReason(
        id: json['id'] as String,
        label: json['label'] as String,
      );
}
