import '../entities/interest_row.dart';
import '../repositories/interests_repository.dart';

class GetReceivedInterestsUseCase {
  final InterestsRepository _repository;
  const GetReceivedInterestsUseCase(this._repository);

  Future<List<InterestRow>> call() => _repository.getReceived();
}
