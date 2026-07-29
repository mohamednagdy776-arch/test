import '../entities/interest_row.dart';
import '../repositories/interests_repository.dart';

class GetSentInterestsUseCase {
  final InterestsRepository _repository;
  const GetSentInterestsUseCase(this._repository);

  Future<List<InterestRow>> call() => _repository.getSent();
}
