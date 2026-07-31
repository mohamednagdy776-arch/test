import 'dart:async';
import 'package:flutter/services.dart' show HapticFeedback;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart' as rtc;
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/socket/socket_client.dart';
import '../../domain/entities/call_peer.dart';
import '../../domain/use_cases/fetch_ice_servers_use_case.dart';
import 'call_state.dart';
import 'webrtc_engine.dart';

/// Auto-cancel an unanswered outgoing call after this long -- mirrors
/// web/src/features/call/CallProvider.tsx's RING_TIMEOUT_MS exactly.
const _kRingTimeoutDuration = Duration(seconds: 40);

/// Brief "ended"/error flash before snapping back to idle -- same timings as
/// web's endCallInternal (1.5s) and failCall (2.5s) setTimeouts.
const _kEndedResetDelay = Duration(milliseconds: 1500);
const _kFailResetDelay = Duration(milliseconds: 2500);

/// Connection-quality sampling cadence -- matches web's getStats() polling.
const _kQualitySampleInterval = Duration(seconds: 2);

/// Lightweight ringtone substitute: haptic pulse while ringing. Web
/// synthesizes an actual audio tone via Web Audio API (Ringtone class); doing
/// the mobile equivalent properly would mean shipping an audio asset + adding
/// an audio-player dependency (just_audio/audioplayers) purely for this one
/// sound, which is scope creep for a phase about getting WebRTC signalling
/// right. Haptic feedback gives real, unmistakable "you're ringing" feedback
/// with zero new dependencies; a follow-up phase can layer in real audio.
const _kRingFeedbackInterval = Duration(seconds: 1);

class CallNotifier extends StateNotifier<CallState> {
  final FetchIceServersUseCase _iceServersUseCase;
  final Future<io.Socket> Function() _connectSocketFn;
  final WebRtcEngine _engine;

  io.Socket? _socket;
  rtc.RTCPeerConnection? _pc;
  rtc.MediaStream? _localStream;
  final List<rtc.RTCIceCandidate> _pendingIce = [];
  bool _attached = false;

  Timer? _ringTimeoutTimer;
  Timer? _resetTimer;
  Timer? _qualityTimer;
  Timer? _ringFeedbackTimer;

  CallNotifier(
    this._iceServersUseCase, {
    Future<io.Socket> Function()? connectSocket,
    WebRtcEngine? engine,
  })  : _connectSocketFn = connectSocket ?? SocketClient.connect,
        _engine = engine ?? const FlutterWebRtcEngine(),
        super(const CallState());

  // ── Setup ────────────────────────────────────────────────────────────

  /// Registers the global call:* socket listeners exactly once. An incoming
  /// call must be able to interrupt ANY screen, so this is called once from
  /// the app root (main.dart), not tied to any particular screen's lifecycle
  /// -- mirrors web's <CallProvider> wrapping the whole app at the root.
  Future<void> attach() async {
    if (_attached) return;
    _attached = true;
    final socket = await _connectSocketFn();
    _socket = socket;
    socket.on('call:incoming', _onIncoming);
    socket.on('call:accepted', _onAccepted);
    socket.on('call:offer', _onOffer);
    socket.on('call:answer', _onAnswer);
    socket.on('call:ice-candidate', _onIceCandidate);
    socket.on('call:rejected', _onRejected);
    socket.on('call:ended', _onEnded);
    socket.on('call:mute', _onPeerMute);
    socket.on('call:camera', _onPeerCamera);
  }

  // ── Phase transition (centralizes the timer bookkeeping web spreads
  // across several `useEffect(..., [phase])` blocks -- StateNotifier has no
  // declarative effect system, so every phase change funnels through here) ──

  void _setPhase(CallPhase phase, {String? error, bool clearError = false}) {
    state = state.copyWith(phase: phase, error: error, clearError: clearError);

    _ringTimeoutTimer?.cancel();
    _ringTimeoutTimer = null;
    if (phase == CallPhase.outgoing) {
      _ringTimeoutTimer = Timer(_kRingTimeoutDuration, () {
        unawaited(_endCallInternal(notify: true, error: 'لا يوجد رد'));
      });
    }

    _ringFeedbackTimer?.cancel();
    _ringFeedbackTimer = null;
    if (phase == CallPhase.outgoing || phase == CallPhase.incoming) {
      _ringFeedbackTimer = Timer.periodic(_kRingFeedbackInterval, (_) => HapticFeedback.mediumImpact());
    }

    if (phase == CallPhase.active || phase == CallPhase.reconnecting) {
      _startQualitySampling();
    } else {
      _qualityTimer?.cancel();
      _qualityTimer = null;
    }
  }

  void _startQualitySampling() {
    if (_qualityTimer != null) return;
    _sampleQuality();
    _qualityTimer = Timer.periodic(_kQualitySampleInterval, (_) => _sampleQuality());
  }

  Future<void> _sampleQuality() async {
    final pc = _pc;
    if (pc == null) return;
    try {
      final stats = await pc.getStats();
      double rtt = 0;
      bool haveRtt = false;
      num lost = 0;
      num recv = 0;
      for (final r in stats) {
        if (r.type == 'candidate-pair' && r.values['nominated'] == true && r.values['currentRoundTripTime'] is num) {
          rtt = (r.values['currentRoundTripTime'] as num).toDouble();
          haveRtt = true;
        }
        if (r.type == 'inbound-rtp' && r.values['kind'] == 'audio') {
          lost = r.values['packetsLost'] as num? ?? 0;
          recv = r.values['packetsReceived'] as num? ?? 0;
        }
      }
      final lossRatio = (recv + lost) > 0 ? lost / (recv + lost) : 0;
      var q = CallQuality.good;
      if (lossRatio > 0.08 || (haveRtt && rtt > 0.4)) {
        q = CallQuality.poor;
      } else if (lossRatio > 0.03 || (haveRtt && rtt > 0.2)) {
        q = CallQuality.fair;
      }
      state = state.copyWith(quality: q);
    } catch (_) {
      // getStats can throw mid-teardown
    }
  }

  // ── Teardown ─────────────────────────────────────────────────────────

  /// Tear everything down and reset transient call fields. Safe to call
  /// multiple times. Does NOT touch phase/peer/error -- callers set those
  /// explicitly afterwards (mirrors web's cleanup()).
  Future<void> _cleanup() async {
    final pc = _pc;
    if (pc != null) {
      try {
        final senders = await pc.getSenders();
        for (final s in senders) {
          await s.track?.stop();
        }
      } catch (_) {
        // already torn down
      }
      try {
        await pc.close();
      } catch (_) {
        // already closed
      }
    }
    _pc = null;
    final stream = _localStream;
    if (stream != null) {
      for (final t in stream.getTracks()) {
        try {
          await t.stop();
        } catch (_) {}
      }
    }
    _localStream = null;
    _pendingIce.clear();
    _qualityTimer?.cancel();
    _qualityTimer = null;
    _ringTimeoutTimer?.cancel();
    _ringTimeoutTimer = null;
    _ringFeedbackTimer?.cancel();
    _ringFeedbackTimer = null;

    state = state.copyWith(
      muted: false,
      speakerOn: true,
      peerMuted: false,
      cameraOn: true,
      peerCameraOff: false,
      clearLocalStream: true,
      clearRemoteStream: true,
      quality: CallQuality.unknown,
    );
  }

  Future<rtc.RTCPeerConnection> _buildPeerConnection(CallPeer target) async {
    final isVideo = target.callType == CallType.video;
    final stream = await _engine.getUserMedia({
      'audio': true,
      'video': isVideo ? {'facingMode': 'user'} : false,
    });
    _localStream = stream;
    state = state.copyWith(localStream: stream, cameraOn: isVideo);

    final iceServers = await _iceServersUseCase();
    final pc = await _engine.createPeerConnection({'iceServers': iceServers});
    for (final track in stream.getTracks()) {
      await pc.addTrack(track, stream);
    }

    pc.onIceCandidate = (candidate) {
      final p = state.peer;
      if (p == null) return;
      _socket?.emit('call:ice-candidate', {
        'conversationId': p.conversationId,
        'targetId': p.userId,
        'candidate': candidate.toMap(),
      });
    };

    pc.onTrack = (event) {
      if (event.streams.isEmpty) return;
      final remote = event.streams.first;
      state = state.copyWith(remoteStream: remote);
      // Honour the current speaker toggle for this fresh stream.
      for (final t in remote.getAudioTracks()) {
        t.enabled = state.speakerOn;
      }
    };

    pc.onConnectionState = (rtcState) {
      if (rtcState == rtc.RTCPeerConnectionState.RTCPeerConnectionStateConnected) {
        // Covers both initial connect and recovery from a transient drop.
        _setPhase(CallPhase.active);
      } else if (rtcState == rtc.RTCPeerConnectionState.RTCPeerConnectionStateDisconnected) {
        if (state.phase == CallPhase.active) _setPhase(CallPhase.reconnecting);
      } else if (rtcState == rtc.RTCPeerConnectionState.RTCPeerConnectionStateFailed ||
          rtcState == rtc.RTCPeerConnectionState.RTCPeerConnectionStateClosed) {
        // Hard failure. No need to notify the peer -- the transport already dropped.
        if (state.phase == CallPhase.active ||
            state.phase == CallPhase.connecting ||
            state.phase == CallPhase.reconnecting) {
          unawaited(_cleanup().then((_) {
            state = state.copyWith(clearPeer: true);
            _setPhase(CallPhase.ended);
            _scheduleEndedReset();
          }));
        }
      }
    };

    _pc = pc;
    return pc;
  }

  Future<void> _drainPendingIce() async {
    final pc = _pc;
    if (pc == null) return;
    final queued = List<rtc.RTCIceCandidate>.from(_pendingIce);
    _pendingIce.clear();
    for (final c in queued) {
      try {
        await pc.addCandidate(c);
      } catch (_) {
        // stale candidate
      }
    }
  }

  void _scheduleEndedReset() {
    _resetTimer?.cancel();
    _resetTimer = Timer(_kEndedResetDelay, () {
      if (state.phase == CallPhase.ended) _setPhase(CallPhase.idle);
    });
  }

  void _scheduleFailReset() {
    _resetTimer?.cancel();
    _resetTimer = Timer(_kFailResetDelay, () {
      if (state.phase == CallPhase.ended) {
        state = state.copyWith(clearPeer: true, clearError: true);
        _setPhase(CallPhase.idle);
      }
    });
  }

  /// Either side hung up / cancelled, with an optional notify-the-peer emit.
  /// Peer is cleared immediately (matches web's endCallInternal/onRejected/
  /// onEnded, which all null out the peer right away -- unlike failCall,
  /// which keeps it during the "ended" flash so a mid-dial error can still
  /// reference who we were calling).
  Future<void> _endCallInternal({required bool notify, String? error}) async {
    final p = state.peer;
    if (notify && p != null) {
      _socket?.emit('call:end', {'conversationId': p.conversationId, 'targetId': p.userId});
    }
    await _cleanup();
    state = state.copyWith(clearPeer: true);
    _setPhase(CallPhase.ended, error: error, clearError: error == null);
    _scheduleEndedReset();
  }

  /// Fail a call attempt WITH visible feedback: keep the overlay up in an
  /// "ended" state showing the error for a moment, instead of snapping
  /// straight back to idle (which would hide the overlay before the user can
  /// read why the call failed -- e.g. callee offline). Mirrors web's failCall.
  Future<void> _failCall(String message) async {
    await _cleanup();
    _setPhase(CallPhase.ended, error: message);
    _scheduleFailReset();
  }

  // ── Public actions ─────────────────────────────────────────────────────

  Future<void> startCall({
    required String conversationId,
    required String calleeId,
    String? peerName,
    String? peerAvatar,
    String? myName,
    String? myAvatar,
    CallType callType = CallType.audio,
  }) async {
    if (state.phase != CallPhase.idle) return;
    final target = CallPeer(
      userId: calleeId,
      conversationId: conversationId,
      name: peerName,
      avatar: peerAvatar,
      callType: callType,
    );
    state = state.copyWith(peer: target, clearError: true);
    _setPhase(CallPhase.outgoing);
    try {
      await _buildPeerConnection(target);
    } catch (_) {
      await _failCall('تعذّر الوصول إلى الميكروفون. تأكّد من منح الإذن.');
      return;
    }
    _socket?.emitWithAck(
      'call:initiate',
      {
        'conversationId': conversationId,
        'calleeId': calleeId,
        'callType': callType == CallType.video ? 'video' : 'audio',
        'callerName': myName,
        'callerAvatar': myAvatar,
      },
      ack: (dynamic response) {
        final ok = response is Map && response['ok'] == true;
        if (!ok) {
          final reason = response is Map ? response['reason'] as String? : null;
          unawaited(_failCall(reason == 'offline' ? 'المستخدم غير متصل حالياً' : 'تعذّر بدء المكالمة'));
        }
      },
    );
  }

  Future<void> acceptCall() async {
    final p = state.peer;
    if (p == null || state.phase != CallPhase.incoming) return;
    _setPhase(CallPhase.connecting);
    try {
      await _buildPeerConnection(p);
    } catch (_) {
      state = state.copyWith(error: 'تعذّر الوصول إلى الميكروفون. تأكّد من منح الإذن.');
      _socket?.emit('call:reject', {'conversationId': p.conversationId, 'targetId': p.userId});
      await _cleanup();
      state = state.copyWith(clearPeer: true, error: state.error);
      _setPhase(CallPhase.idle, error: state.error);
      return;
    }
    // Tell the caller we're ready; it will respond with an SDP offer.
    _socket?.emit('call:accept', {'conversationId': p.conversationId, 'targetId': p.userId});
  }

  void rejectCall() {
    final p = state.peer;
    if (p != null) {
      _socket?.emit('call:reject', {'conversationId': p.conversationId, 'targetId': p.userId});
    }
    unawaited(_cleanup().then((_) {
      state = state.copyWith(clearPeer: true);
      _setPhase(CallPhase.idle);
    }));
  }

  void endCall() => unawaited(_endCallInternal(notify: true));

  void toggleMute() {
    final stream = _localStream;
    if (stream == null) return;
    final next = !state.muted;
    for (final t in stream.getAudioTracks()) {
      t.enabled = !next;
    }
    state = state.copyWith(muted: next);
    final p = state.peer;
    if (p != null) {
      _socket?.emit('call:mute', {'conversationId': p.conversationId, 'targetId': p.userId, 'muted': next});
    }
  }

  /// Speaker = whether we can hear the remote party. Mirrors web's semantics
  /// exactly (mutes the incoming audio sink, mic/transport untouched) by
  /// disabling the remote stream's audio track(s); additionally routes to
  /// the device loudspeaker (a mobile-only affordance web has no equivalent
  /// of, since there's no earpiece/speaker distinction on desktop).
  void toggleSpeaker() {
    final next = !state.speakerOn;
    state = state.copyWith(speakerOn: next);
    final remote = state.remoteStream;
    if (remote != null) {
      for (final t in remote.getAudioTracks()) {
        t.enabled = next;
      }
    }
    unawaited(_engine.setSpeakerphoneOn(next));
  }

  /// Camera = enable/disable our outgoing video track (video calls only). The
  /// track stays in the sender so we don't renegotiate; the peer just
  /// receives black frames, and we relay the state so they can show a
  /// placeholder.
  void toggleCamera() {
    final stream = _localStream;
    if (stream == null) return;
    final tracks = stream.getVideoTracks();
    if (tracks.isEmpty) return;
    final next = !state.cameraOn;
    for (final t in tracks) {
      t.enabled = next;
    }
    state = state.copyWith(cameraOn: next);
    final p = state.peer;
    if (p != null) {
      _socket?.emit('call:camera', {'conversationId': p.conversationId, 'targetId': p.userId, 'cameraOff': !next});
    }
  }

  // ── Socket signalling handlers ───────────────────────────────────────

  void _onIncoming(dynamic data) {
    final d = data as Map<dynamic, dynamic>;
    // Already busy -> auto-decline so the caller isn't left ringing.
    if (state.phase != CallPhase.idle) {
      _socket?.emit('call:reject', {'conversationId': d['conversationId'], 'targetId': d['from']});
      return;
    }
    state = state.copyWith(
      clearError: true,
      peer: CallPeer(
        userId: d['from'] as String,
        conversationId: d['conversationId'] as String,
        name: d['callerName'] as String?,
        avatar: d['callerAvatar'] as String?,
        callType: d['callType'] == 'video' ? CallType.video : CallType.audio,
      ),
    );
    _setPhase(CallPhase.incoming);
  }

  // Caller side: callee accepted -> create and send the SDP offer.
  Future<void> _onAccepted(dynamic data) async {
    final pc = _pc;
    final p = state.peer;
    if (pc == null || p == null) return;
    _setPhase(CallPhase.connecting);
    final offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    _socket?.emit('call:offer', {
      'conversationId': p.conversationId,
      'targetId': p.userId,
      'sdp': offer.toMap(),
    });
  }

  // Callee side: received offer -> answer it.
  Future<void> _onOffer(dynamic data) async {
    final d = data as Map<dynamic, dynamic>;
    final pc = _pc;
    final p = state.peer;
    if (pc == null || p == null || d['from'] != p.userId) return;
    final sdpMap = d['sdp'] as Map<dynamic, dynamic>;
    await pc.setRemoteDescription(rtc.RTCSessionDescription(sdpMap['sdp'] as String?, sdpMap['type'] as String?));
    await _drainPendingIce();
    final answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    _socket?.emit('call:answer', {
      'conversationId': p.conversationId,
      'targetId': p.userId,
      'sdp': answer.toMap(),
    });
  }

  // Caller side: received the answer.
  Future<void> _onAnswer(dynamic data) async {
    final d = data as Map<dynamic, dynamic>;
    final pc = _pc;
    if (pc == null || d['from'] != state.peer?.userId) return;
    final sdpMap = d['sdp'] as Map<dynamic, dynamic>;
    await pc.setRemoteDescription(rtc.RTCSessionDescription(sdpMap['sdp'] as String?, sdpMap['type'] as String?));
    await _drainPendingIce();
  }

  Future<void> _onIceCandidate(dynamic data) async {
    final d = data as Map<dynamic, dynamic>;
    final pc = _pc;
    if (pc == null || d['from'] != state.peer?.userId) return;
    final c = d['candidate'] as Map<dynamic, dynamic>;
    final candidate = rtc.RTCIceCandidate(
      c['candidate'] as String?,
      c['sdpMid'] as String?,
      c['sdpMLineIndex'] as int?,
    );
    final remoteDesc = await pc.getRemoteDescription();
    if (remoteDesc != null && remoteDesc.type != null) {
      try {
        await pc.addCandidate(candidate);
      } catch (_) {
        // stale
      }
    } else {
      _pendingIce.add(candidate);
    }
  }

  void _onRejected(dynamic data) {
    if (state.phase == CallPhase.idle) return;
    unawaited(_cleanup().then((_) {
      state = state.copyWith(clearPeer: true, error: 'تم رفض المكالمة');
      _setPhase(CallPhase.ended, error: 'تم رفض المكالمة');
      _scheduleEndedReset();
    }));
  }

  void _onEnded(dynamic data) {
    if (state.phase == CallPhase.idle) return;
    unawaited(_cleanup().then((_) {
      state = state.copyWith(clearPeer: true);
      _setPhase(CallPhase.ended);
      _scheduleEndedReset();
    }));
  }

  void _onPeerMute(dynamic data) {
    final d = data as Map<dynamic, dynamic>;
    if (d['from'] != state.peer?.userId) return;
    state = state.copyWith(peerMuted: d['muted'] == true);
  }

  void _onPeerCamera(dynamic data) {
    final d = data as Map<dynamic, dynamic>;
    if (d['from'] != state.peer?.userId) return;
    state = state.copyWith(peerCameraOff: d['cameraOff'] == true);
  }

  @override
  void dispose() {
    _ringTimeoutTimer?.cancel();
    _resetTimer?.cancel();
    _qualityTimer?.cancel();
    _ringFeedbackTimer?.cancel();
    final socket = _socket;
    if (socket != null) {
      socket.off('call:incoming', _onIncoming);
      socket.off('call:accepted', _onAccepted);
      socket.off('call:offer', _onOffer);
      socket.off('call:answer', _onAnswer);
      socket.off('call:ice-candidate', _onIceCandidate);
      socket.off('call:rejected', _onRejected);
      socket.off('call:ended', _onEnded);
      socket.off('call:mute', _onPeerMute);
      socket.off('call:camera', _onPeerCamera);
    }
    super.dispose();
  }
}
