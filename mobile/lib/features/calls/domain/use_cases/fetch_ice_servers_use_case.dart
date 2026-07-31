import '../repositories/calls_repository.dart';

class FetchIceServersUseCase {
  final CallsRepository _repository;
  const FetchIceServersUseCase(this._repository);

  Future<List<Map<String, dynamic>>> call() => _repository.fetchIceServers();
}
