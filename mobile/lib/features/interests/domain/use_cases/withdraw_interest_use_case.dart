import '../repositories/interests_repository.dart';

class WithdrawInterestUseCase {
  final InterestsRepository _repository;
  const WithdrawInterestUseCase(this._repository);

  Future<void> call(String userId) => _repository.withdrawInterest(userId);
}
