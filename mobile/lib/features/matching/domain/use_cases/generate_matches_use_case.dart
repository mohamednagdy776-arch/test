import '../repositories/matching_repository.dart';

class GenerateMatchesUseCase {
  final MatchingRepository _repository;
  const GenerateMatchesUseCase(this._repository);

  Future<void> call() => _repository.generateMatches();
}
