import 'package:fake_async/fake_async.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart' as rtc;
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:tayyibt/features/calls/domain/entities/call_peer.dart';
import 'package:tayyibt/features/calls/domain/repositories/calls_repository.dart';
import 'package:tayyibt/features/calls/domain/use_cases/fetch_ice_servers_use_case.dart';
import 'package:tayyibt/features/calls/presentation/state/call_notifier.dart';
import 'package:tayyibt/features/calls/presentation/state/webrtc_engine.dart';

class MockCallsRepository extends Mock implements CallsRepository {}

class MockSocket extends Mock implements io.Socket {}

class MockWebRtcEngine extends Mock implements WebRtcEngine {}

class MockRTCPeerConnection extends Mock implements rtc.RTCPeerConnection {}

class MockMediaStream extends Mock implements rtc.MediaStream {}

class MockMediaStreamTrack extends Mock implements rtc.MediaStreamTrack {}

class MockRTCRtpSender extends Mock implements rtc.RTCRtpSender {}

class _FakeMediaStreamTrack extends Fake implements rtc.MediaStreamTrack {}

class _FakeMediaStream extends Fake implements rtc.MediaStream {}

void main() {
  // The ring-timeout test drives real Timers via fake_async, which fires
  // CallNotifier's haptic "ringing" feedback -- that touches a platform
  // channel (HapticFeedback), which needs a test binding to route through
  // harmlessly instead of throwing "Binding has not yet been initialized".
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() {
    registerFallbackValue(rtc.RTCSessionDescription('sdp', 'offer'));
    registerFallbackValue(rtc.RTCIceCandidate('candidate', 'mid', 0));
    registerFallbackValue(_FakeMediaStreamTrack());
    registerFallbackValue(_FakeMediaStream());
  });

  late MockCallsRepository repository;
  late MockSocket socket;
  late MockWebRtcEngine engine;
  late MockRTCPeerConnection pc;
  late MockMediaStream localStream;
  late MockMediaStreamTrack audioTrack;
  late CallNotifier notifier;

  final Map<String, void Function(dynamic)> handlers = {};

  void emitEvent(String event, dynamic payload) {
    handlers[event]!(payload);
  }

  setUp(() {
    repository = MockCallsRepository();
    socket = MockSocket();
    engine = MockWebRtcEngine();
    pc = MockRTCPeerConnection();
    localStream = MockMediaStream();
    audioTrack = MockMediaStreamTrack();
    handlers.clear();

    when(() => repository.fetchIceServers()).thenAnswer((_) async => [
          {'urls': 'stun:stun.l.google.com:19302'}
        ]);

    when(() => socket.on(any(), any())).thenAnswer((invocation) {
      final event = invocation.positionalArguments[0] as String;
      final handler = invocation.positionalArguments[1] as void Function(dynamic);
      handlers[event] = handler;
    });
    when(() => socket.off(any(), any())).thenReturn(null);
    when(() => socket.emit(any(), any())).thenReturn(null);
    when(() => socket.emitWithAck(any(), any(), ack: any(named: 'ack'))).thenReturn(null);

    when(() => audioTrack.enabled).thenReturn(true);
    when(() => localStream.getTracks()).thenReturn([audioTrack]);
    when(() => localStream.getAudioTracks()).thenReturn([audioTrack]);
    when(() => localStream.getVideoTracks()).thenReturn([]);

    when(() => engine.getUserMedia(any())).thenAnswer((_) async => localStream);
    when(() => engine.createPeerConnection(any())).thenAnswer((_) async => pc);
    when(() => engine.setSpeakerphoneOn(any())).thenAnswer((_) async {});

    when(() => pc.addTrack(any(), any())).thenAnswer((_) async => MockRTCRtpSender());
    pc.onIceCandidate = null;
    pc.onTrack = null;
    pc.onConnectionState = null;
    when(() => pc.getSenders()).thenAnswer((_) async => []);
    when(() => pc.close()).thenAnswer((_) async {});
    when(() => pc.createOffer()).thenAnswer((_) async => rtc.RTCSessionDescription('offer-sdp', 'offer'));
    when(() => pc.setLocalDescription(any())).thenAnswer((_) async {});

    notifier = CallNotifier(
      FetchIceServersUseCase(repository),
      connectSocket: () async => socket,
      engine: engine,
    );
  });

  Future<void> attach() => notifier.attach();

  group('incoming calls', () {
    test('while idle sets phase to incoming with the caller\'s identity from the payload', () async {
      await attach();

      emitEvent('call:incoming', {
        'from': 'caller-1',
        'conversationId': 'c1',
        'callType': 'video',
        'callerName': 'Ahmed',
        'callerAvatar': '/avatars/a.jpg',
      });

      expect(notifier.state.phase, CallPhase.incoming);
      expect(notifier.state.peer?.userId, 'caller-1');
      expect(notifier.state.peer?.name, 'Ahmed');
      expect(notifier.state.peer?.callType, CallType.video);
    });

    test('while busy auto-rejects without changing phase', () async {
      await attach();
      emitEvent('call:incoming', {
        'from': 'caller-1',
        'conversationId': 'c1',
        'callType': 'audio',
        'callerName': 'Ahmed',
      });
      expect(notifier.state.phase, CallPhase.incoming);

      emitEvent('call:incoming', {
        'from': 'caller-2',
        'conversationId': 'c2',
        'callType': 'audio',
        'callerName': 'Sara',
      });

      // Still ringing for caller-1 -- caller-2 was auto-declined.
      expect(notifier.state.phase, CallPhase.incoming);
      expect(notifier.state.peer?.userId, 'caller-1');
      verify(() => socket.emit('call:reject', {'conversationId': 'c2', 'targetId': 'caller-2'})).called(1);
    });

    test('rejectCall emits call:reject and returns to idle', () async {
      await attach();
      emitEvent('call:incoming', {
        'from': 'caller-1',
        'conversationId': 'c1',
        'callType': 'audio',
        'callerName': 'Ahmed',
      });

      notifier.rejectCall();
      await Future<void>.delayed(Duration.zero);

      verify(() => socket.emit('call:reject', {'conversationId': 'c1', 'targetId': 'caller-1'})).called(1);
      expect(notifier.state.phase, CallPhase.idle);
      expect(notifier.state.peer, isNull);
    });

    test('call:rejected while idle is ignored (no active call to reject)', () async {
      await attach();
      emitEvent('call:rejected', {'from': 'x', 'conversationId': 'c1'});
      expect(notifier.state.phase, CallPhase.idle);
    });
  });

  group('starting a call', () {
    test('is a no-op if a call is already in progress', () async {
      await attach();
      emitEvent('call:incoming', {
        'from': 'caller-1',
        'conversationId': 'c1',
        'callType': 'audio',
        'callerName': 'Ahmed',
      });
      expect(notifier.state.phase, CallPhase.incoming);

      await notifier.startCall(conversationId: 'c2', calleeId: 'other', myName: 'Me');

      // Unchanged -- still the incoming call, no outgoing attempt started.
      expect(notifier.state.phase, CallPhase.incoming);
      expect(notifier.state.peer?.userId, 'caller-1');
    });

    test('sends the CALLER\'s own identity as callerName/callerAvatar, not the callee\'s', () async {
      // Regression check: web/src/features/chat/components/ChatWindow.tsx
      // passes the CALLEE's name/avatar into startCall()'s `name`/`avatar`,
      // which CallProvider.tsx then re-sends to the server as
      // callerName/callerAvatar -- so the callee would see their OWN name
      // echoed back as the caller's identity. This client keeps the two
      // concerns (local display peer vs. wire-format callerName) separate.
      await attach();

      await notifier.startCall(
        conversationId: 'c1',
        calleeId: 'callee-1',
        peerName: 'Callee Display Name',
        peerAvatar: '/avatars/callee.jpg',
        myName: 'My Real Name',
        myAvatar: '/avatars/me.jpg',
        callType: CallType.audio,
      );

      expect(notifier.state.phase, CallPhase.outgoing);
      expect(notifier.state.peer?.name, 'Callee Display Name'); // local display = callee

      final captured = verify(() => socket.emitWithAck('call:initiate', captureAny(), ack: any(named: 'ack')))
          .captured
          .single as Map;
      expect(captured['calleeId'], 'callee-1');
      expect(captured['callerName'], 'My Real Name'); // wire payload = caller (me)
      expect(captured['callerAvatar'], '/avatars/me.jpg');
    });

    test('mic/camera failure surfaces a permission error and ends the call', () async {
      when(() => engine.getUserMedia(any())).thenThrow(Exception('permission denied'));
      await attach();

      await notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me');

      expect(notifier.state.phase, CallPhase.ended);
      expect(notifier.state.error, contains('الميكروفون'));
      verifyNever(() => socket.emitWithAck('call:initiate', any(), ack: any(named: 'ack')));
    });

    test('an "offline" ack failure fails the call with the offline message', () async {
      await attach();
      when(() => socket.emitWithAck('call:initiate', any(), ack: any(named: 'ack'))).thenAnswer((invocation) {
        final ack = invocation.namedArguments[#ack] as Function;
        ack({'ok': false, 'reason': 'offline'});
      });

      await notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me');
      await Future<void>.delayed(Duration.zero);

      expect(notifier.state.phase, CallPhase.ended);
      expect(notifier.state.error, 'المستخدم غير متصل حالياً');
    });

    test('an unanswered outgoing call auto-ends after the 40s ring timeout', () async {
      fakeAsync((async) {
        // ignore: unawaited_futures
        attach();
        async.flushMicrotasks();

        // ignore: unawaited_futures
        notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me');
        async.flushMicrotasks();
        expect(notifier.state.phase, CallPhase.outgoing);

        async.elapse(const Duration(seconds: 41));
        async.flushMicrotasks();

        expect(notifier.state.phase, CallPhase.ended);
        expect(notifier.state.error, 'لا يوجد رد');
        verify(() => socket.emit('call:end', {'conversationId': 'c1', 'targetId': 'callee-1'})).called(1);
      });
    });
  });

  group('acceptCall', () {
    test('is a no-op when not in the incoming phase', () async {
      await attach();
      await notifier.acceptCall();
      expect(notifier.state.phase, CallPhase.idle);
      verifyNever(() => engine.getUserMedia(any()));
    });

    test('builds the peer connection and emits call:accept', () async {
      await attach();
      emitEvent('call:incoming', {
        'from': 'caller-1',
        'conversationId': 'c1',
        'callType': 'audio',
        'callerName': 'Ahmed',
      });

      await notifier.acceptCall();

      expect(notifier.state.phase, CallPhase.connecting);
      verify(() => socket.emit('call:accept', {'conversationId': 'c1', 'targetId': 'caller-1'})).called(1);
    });
  });

  group('mute/camera toggles', () {
    test('toggleMute disables the local audio track and emits call:mute', () async {
      await attach();
      await notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me');

      notifier.toggleMute();

      expect(notifier.state.muted, isTrue);
      verify(() => audioTrack.enabled = false).called(1);
      verify(() => socket.emit('call:mute', {'conversationId': 'c1', 'targetId': 'callee-1', 'muted': true})).called(1);
    });

    test('toggleCamera is a no-op for an audio call (no video track)', () async {
      await attach();
      await notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me', callType: CallType.audio);

      // An audio call's local stream has no video track (getVideoTracks==[]),
      // and buildPeerConnection already set cameraOn=false for it (mirrors
      // web's setCameraOn(isVideo) -- "audio calls have no video track").
      expect(notifier.state.cameraOn, isFalse);

      notifier.toggleCamera();

      expect(notifier.state.cameraOn, isFalse); // unchanged -- toggle bailed out
      verifyNever(() => socket.emit('call:camera', any()));
    });
  });

  group('peer state relayed over the socket', () {
    test('call:mute from the current peer updates peerMuted', () async {
      await attach();
      await notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me');

      emitEvent('call:mute', {'from': 'callee-1', 'muted': true});
      expect(notifier.state.peerMuted, isTrue);

      emitEvent('call:mute', {'from': 'someone-else', 'muted': false});
      expect(notifier.state.peerMuted, isTrue); // ignored -- not our peer
    });

    test('call:camera from the current peer updates peerCameraOff', () async {
      await attach();
      await notifier.startCall(conversationId: 'c1', calleeId: 'callee-1', myName: 'Me', callType: CallType.video);

      emitEvent('call:camera', {'from': 'callee-1', 'cameraOff': true});
      expect(notifier.state.peerCameraOff, isTrue);
    });
  });
}
