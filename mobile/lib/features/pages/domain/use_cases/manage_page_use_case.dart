import 'package:image_picker/image_picker.dart';
import '../entities/page.dart';
import '../repositories/pages_repository.dart';

class ManagePageUseCase {
  final PagesRepository _repository;
  const ManagePageUseCase(this._repository);

  Future<CommunityPage> create({
    required String name,
    String? description,
    String? category,
    String privacy = 'public',
    String? website,
    String? contactInfo,
    String? location,
    String? hours,
    XFile? profilePhoto,
    XFile? coverPhoto,
  }) =>
      _repository.createPage(
        name: name,
        description: description,
        category: category,
        privacy: privacy,
        website: website,
        contactInfo: contactInfo,
        location: location,
        hours: hours,
        profilePhoto: profilePhoto,
        coverPhoto: coverPhoto,
      );

  Future<CommunityPage> update(
    String id, {
    String? name,
    String? description,
    String? category,
    String? privacy,
    String? website,
    String? contactInfo,
    String? location,
    String? hours,
    XFile? profilePhoto,
    XFile? coverPhoto,
  }) =>
      _repository.updatePage(
        id,
        name: name,
        description: description,
        category: category,
        privacy: privacy,
        website: website,
        contactInfo: contactInfo,
        location: location,
        hours: hours,
        profilePhoto: profilePhoto,
        coverPhoto: coverPhoto,
      );

  Future<CommunityPage> follow(String id) => _repository.follow(id);
  Future<void> unfollow(String id) => _repository.unfollow(id);
  Future<CommunityPage> like(String id) => _repository.like(id);
  Future<void> unlike(String id) => _repository.unlike(id);
}
