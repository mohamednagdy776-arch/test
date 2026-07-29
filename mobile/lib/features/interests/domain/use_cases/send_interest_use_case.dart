import '../repositories/interests_repository.dart';

class SendInterestUseCase {
  final InterestsRepository _repository;
  const SendInterestUseCase(this._repository);

  /// Returns { status, mutual }.
  Future<Map<String, dynamic>> call(String userId) => _repository.sendInterest(userId);
}
