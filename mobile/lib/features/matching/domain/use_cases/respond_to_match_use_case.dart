import '../repositories/matching_repository.dart';

// Accept/reject/undo are all thin one-line repository pass-throughs -- one
// class instead of four near-identical files.
class RespondToMatchUseCase {
  final MatchingRepository _repository;
  const RespondToMatchUseCase(this._repository);

  Future<void> accept(String id) => _repository.acceptMatch(id);
  Future<void> reject(String id) => _repository.rejectMatch(id);
  Future<void> undoAccept(String id) => _repository.undoAccept(id);
  Future<void> undoReject(String id) => _repository.undoReject(id);
}
