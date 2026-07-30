import '../entities/page.dart';
import '../repositories/pages_repository.dart';

class PageDetailUseCase {
  final PagesRepository _repository;
  const PageDetailUseCase(this._repository);

  Future<Page> call(String id) => _repository.getPage(id);
}
