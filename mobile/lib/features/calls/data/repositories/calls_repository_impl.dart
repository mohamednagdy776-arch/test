import '../../domain/repositories/calls_repository.dart';
import '../data_sources/calls_remote_data_source.dart';

/// Public-STUN fallback used if the backend can't be reached -- mirrors
/// web/src/features/call/config.ts's STUN_FALLBACK exactly.
const List<Map<String, dynamic>> kStunFallback = [
  {
    'urls': 'stun:stun.l.google.com:19302',
  },
  {
    'urls': 'stun:stun1.l.google.com:19302',
  },
];

class CallsRepositoryImpl implements CallsRepository {
  final CallsRemoteDataSource _dataSource;
  const CallsRepositoryImpl(this._dataSource);

  @override
  Future<List<Map<String, dynamic>>> fetchIceServers() async {
    try {
      final servers = await _dataSource.getIceServers();
      if (servers.isNotEmpty) return servers;
    } catch (_) {
      // fall through to STUN-only
    }
    return kStunFallback;
  }
}
