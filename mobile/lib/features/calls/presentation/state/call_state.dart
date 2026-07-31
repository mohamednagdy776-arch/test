import 'package:flutter_webrtc/flutter_webrtc.dart' show MediaStream;
import '../../domain/entities/call_peer.dart';

/// Mirrors web CallProvider's context value shape (phase/peer/muted/speakerOn/
/// peerMuted/cameraOn/peerCameraOff/localStream/remoteStream/quality/error).
class CallState {
  final CallPhase phase;
  final CallPeer? peer;
  final bool muted;

  /// whether the remote audio is audible (speaker on)
  final bool speakerOn;

  /// true when the OTHER party has muted their mic
  final bool peerMuted;

  /// whether our camera is on (video calls only)
  final bool cameraOn;

  /// true when the OTHER party has turned their camera off (video calls)
  final bool peerCameraOff;

  /// our local media stream (for self-preview in video calls)
  final MediaStream? localStream;

  /// the remote party's media stream (rendered in video calls)
  final MediaStream? remoteStream;

  /// rough live connection quality while a call is active
  final CallQuality quality;

  /// error message (e.g. mic permission denied, callee offline) or null
  final String? error;

  const CallState({
    this.phase = CallPhase.idle,
    this.peer,
    this.muted = false,
    this.speakerOn = true,
    this.peerMuted = false,
    this.cameraOn = true,
    this.peerCameraOff = false,
    this.localStream,
    this.remoteStream,
    this.quality = CallQuality.unknown,
    this.error,
  });

  CallState copyWith({
    CallPhase? phase,
    CallPeer? peer,
    bool clearPeer = false,
    bool? muted,
    bool? speakerOn,
    bool? peerMuted,
    bool? cameraOn,
    bool? peerCameraOff,
    MediaStream? localStream,
    bool clearLocalStream = false,
    MediaStream? remoteStream,
    bool clearRemoteStream = false,
    CallQuality? quality,
    String? error,
    bool clearError = false,
  }) {
    return CallState(
      phase: phase ?? this.phase,
      peer: clearPeer ? null : (peer ?? this.peer),
      muted: muted ?? this.muted,
      speakerOn: speakerOn ?? this.speakerOn,
      peerMuted: peerMuted ?? this.peerMuted,
      cameraOn: cameraOn ?? this.cameraOn,
      peerCameraOff: peerCameraOff ?? this.peerCameraOff,
      localStream: clearLocalStream ? null : (localStream ?? this.localStream),
      remoteStream: clearRemoteStream ? null : (remoteStream ?? this.remoteStream),
      quality: quality ?? this.quality,
      error: clearError ? null : (error ?? this.error),
    );
  }
}
