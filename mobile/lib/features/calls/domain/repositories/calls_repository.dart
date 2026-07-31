/// ICE server configuration for WebRTC calls -- mirrors web/src/features/call/config.ts.
abstract class CallsRepository {
  /// Fetches `GET /calls/ice-servers`. Falls back to public STUN on any
  /// failure so a call still has a chance of connecting (mirrors config.ts's
  /// fetchIceServers try/catch -- TURN may not be configured server-side).
  Future<List<Map<String, dynamic>>> fetchIceServers();
}
