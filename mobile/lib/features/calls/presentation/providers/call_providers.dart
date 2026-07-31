import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/dio_client.dart';
import '../../data/data_sources/calls_remote_data_source.dart';
import '../../data/repositories/calls_repository_impl.dart';
import '../../domain/repositories/calls_repository.dart';
import '../../domain/use_cases/fetch_ice_servers_use_case.dart';
import '../state/call_notifier.dart';
import '../state/call_state.dart';

final callsRemoteDataSourceProvider = Provider((ref) {
  return CallsRemoteDataSource(DioClient.create());
});

final callsRepositoryProvider = Provider<CallsRepository>((ref) {
  return CallsRepositoryImpl(ref.read(callsRemoteDataSourceProvider));
});

final fetchIceServersUseCaseProvider = Provider((ref) {
  return FetchIceServersUseCase(ref.read(callsRepositoryProvider));
});

/// A single, app-wide call -- NOT a `.family`/`.autoDispose` provider. A call
/// can be initiated or received regardless of which screen is on top, and
/// must survive navigation for the whole app lifetime, mirroring web's one
/// <CallProvider> mounted at the root wrapping every page.
final callNotifierProvider = StateNotifierProvider<CallNotifier, CallState>((ref) {
  return CallNotifier(ref.read(fetchIceServersUseCaseProvider));
});
