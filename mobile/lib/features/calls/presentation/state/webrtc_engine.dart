import 'package:flutter_webrtc/flutter_webrtc.dart' as rtc;

/// Thin seam over flutter_webrtc's top-level functions/static helpers so
/// CallNotifier's signalling/state-machine logic can be unit tested with a
/// fake engine instead of hitting real platform channels (no emulator/real
/// device available in this environment -- see FakeWebRtcEngine in tests).
abstract class WebRtcEngine {
  Future<rtc.MediaStream> getUserMedia(Map<String, dynamic> constraints);
  Future<rtc.RTCPeerConnection> createPeerConnection(Map<String, dynamic> configuration);
  Future<void> setSpeakerphoneOn(bool enable);
}

class FlutterWebRtcEngine implements WebRtcEngine {
  const FlutterWebRtcEngine();

  @override
  Future<rtc.MediaStream> getUserMedia(Map<String, dynamic> constraints) {
    return rtc.navigator.mediaDevices.getUserMedia(constraints);
  }

  @override
  Future<rtc.RTCPeerConnection> createPeerConnection(Map<String, dynamic> configuration) {
    return rtc.createPeerConnection(configuration);
  }

  @override
  Future<void> setSpeakerphoneOn(bool enable) {
    return rtc.Helper.setSpeakerphoneOn(enable);
  }
}
