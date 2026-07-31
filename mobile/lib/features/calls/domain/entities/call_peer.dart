/// Mirrors web/src/features/call/config.ts's CallType/CallPhase/CallQuality/CallPeer.
enum CallType { audio, video }

/// Phase of the call state machine -- drives which UI the overlay renders.
/// Exact mirror of web's CallPhase union.
enum CallPhase {
  idle,
  outgoing, // we rang, waiting for the other side
  incoming, // someone is ringing us
  connecting, // accepted, negotiating SDP/ICE
  active, // media flowing
  reconnecting, // transport blip -- trying to recover before giving up
  ended,
}

/// Rough connection-quality bucket derived from WebRTC getStats().
enum CallQuality { good, fair, poor, unknown }

class CallPeer {
  final String userId;
  final String conversationId;
  final String? name;
  final String? avatar;
  final CallType callType;

  const CallPeer({
    required this.userId,
    required this.conversationId,
    this.name,
    this.avatar,
    required this.callType,
  });
}
