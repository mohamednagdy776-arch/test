import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart' as rtc;
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../domain/entities/call_peer.dart';
import '../providers/call_providers.dart';
import '../state/call_notifier.dart';
import '../state/call_state.dart';
import '../util/call_permissions.dart';

const Map<CallPhase, String> _kStatusText = {
  CallPhase.idle: '',
  CallPhase.outgoing: 'جارٍ الاتصال…',
  CallPhase.incoming: 'مكالمة واردة',
  CallPhase.connecting: 'جارٍ الاتصال…',
  CallPhase.active: '',
  CallPhase.reconnecting: 'جارٍ إعادة الاتصال…',
  CallPhase.ended: 'انتهت المكالمة',
};

const Map<CallQuality, Color> _kQualityColor = {
  CallQuality.good: AppTheme.successColor,
  CallQuality.fair: AppTheme.warningColor,
  CallQuality.poor: AppTheme.dangerColor,
};

String _fmt(int seconds) {
  final m = (seconds ~/ 60).toString().padLeft(2, '0');
  final s = (seconds % 60).toString().padLeft(2, '0');
  return '$m:$s';
}

/// Mounted once at the app root (see main.dart's MaterialApp.router `builder`)
/// so an incoming call can interrupt ANY screen -- mirrors web's <CallProvider>
/// wrapping the whole app and always rendering <CallOverlay> when phase != idle.
class CallOverlayHost extends ConsumerStatefulWidget {
  final Widget child;
  const CallOverlayHost({super.key, required this.child});

  @override
  ConsumerState<CallOverlayHost> createState() => _CallOverlayHostState();
}

class _CallOverlayHostState extends ConsumerState<CallOverlayHost> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(callNotifierProvider.notifier).attach());
  }

  @override
  Widget build(BuildContext context) {
    final phase = ref.watch(callNotifierProvider.select((s) => s.phase));
    return Stack(
      children: [
        widget.child,
        if (phase != CallPhase.idle) const CallOverlay(),
      ],
    );
  }
}

/// Full-screen incoming/outgoing/in-call UI. Layout choices mirror
/// web/src/features/call/CallOverlay.tsx: a centered card for audio calls
/// (and video while ringing/incoming/ended), a full-bleed video stage with a
/// self-preview PiP once a video call is actually connecting/active.
///
/// Deliberate simplification vs. web: no "minimize to floating bar" mode --
/// mobile has no persistent browser chrome to minimize into, and a call
/// screen the user can background via the OS home button already covers the
/// same "keep using the app while on a call" need without extra UI.
class CallOverlay extends ConsumerStatefulWidget {
  const CallOverlay({super.key});

  @override
  ConsumerState<CallOverlay> createState() => _CallOverlayState();
}

class _CallOverlayState extends ConsumerState<CallOverlay> {
  Timer? _ticker;
  int _elapsed = 0;
  bool _wasInCall = false;

  void _syncTicker(bool inCall) {
    if (inCall == _wasInCall) return;
    _wasInCall = inCall;
    _ticker?.cancel();
    if (inCall) {
      _elapsed = 0;
      _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) setState(() => _elapsed++);
      });
    } else {
      _elapsed = 0;
    }
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(callNotifierProvider);
    final notifier = ref.read(callNotifierProvider.notifier);
    final phase = state.phase;
    final peer = state.peer;
    final inCall = phase == CallPhase.active || phase == CallPhase.reconnecting;
    final isVideo = peer?.callType == CallType.video;

    _syncTicker(inCall);

    final name = peer?.name?.isNotEmpty == true ? peer!.name! : 'مستخدم';
    final avatar = resolveMediaUrl(peer?.avatar);
    final subtitle = phase == CallPhase.active ? _fmt(_elapsed) : (state.error ?? _kStatusText[phase] ?? '');

    final remoteVideoLive = isVideo &&
        inCall &&
        !state.peerCameraOff &&
        state.remoteStream != null &&
        state.remoteStream!.getVideoTracks().any((t) => t.enabled);

    if (isVideo && phase != CallPhase.incoming && phase != CallPhase.ended) {
      return _VideoStage(
        state: state,
        notifier: notifier,
        name: name,
        avatar: avatar,
        subtitle: subtitle,
        elapsed: _elapsed,
        inCall: inCall,
        remoteVideoLive: remoteVideoLive,
      );
    }

    return _CardOverlay(
      state: state,
      notifier: notifier,
      name: name,
      avatar: avatar,
      subtitle: subtitle,
      isVideo: isVideo,
      inCall: inCall,
    );
  }
}

class _Avatar extends StatelessWidget {
  final String? avatar;
  final String name;
  final double size;
  const _Avatar({required this.avatar, required this.name, this.size = 96});

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '؟';
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.primaryColor, AppTheme.accentColor],
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: avatar != null
          ? Image.network(avatar!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _initialText(initial))
          : _initialText(initial),
    );
  }

  Widget _initialText(String initial) => Center(
        child: Text(
          initial,
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: size * 0.32),
        ),
      );
}

class _QualityBars extends StatelessWidget {
  final CallQuality quality;
  final Color inactiveColor;
  const _QualityBars({required this.quality, this.inactiveColor = const Color(0xFFD9CFB8)});

  @override
  Widget build(BuildContext context) {
    if (quality == CallQuality.unknown) return const SizedBox.shrink();
    final lit = quality == CallQuality.good ? 3 : (quality == CallQuality.fair ? 2 : 1);
    final color = _kQualityColor[quality]!;
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(3, (i) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 1),
          width: 3,
          height: 5.0 + i * 4,
          decoration: BoxDecoration(
            color: i < lit ? color : inactiveColor,
            borderRadius: BorderRadius.circular(1),
          ),
        );
      }),
    );
  }
}

class _CallButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color? background;
  final String label;
  final VoidCallback onPressed;
  final bool dark;
  const _CallButton({
    required this.icon,
    required this.color,
    this.background,
    required this.label,
    required this.onPressed,
    this.dark = false,
  });

  @override
  Widget build(BuildContext context) {
    final filled = background == null;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Material(
          color: filled ? color : background,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onPressed,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Icon(icon, color: filled ? Colors.white : color, size: 24),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 11, color: dark ? Colors.white70 : AppTheme.textSecondary)),
      ],
    );
  }
}

/// Card-style overlay used for audio calls in every phase, and video calls
/// while ringing/incoming/ended (matches web's fallback branch).
class _CardOverlay extends StatelessWidget {
  final CallState state;
  final CallNotifier notifier;
  final String name;
  final String? avatar;
  final String subtitle;
  final bool isVideo;
  final bool inCall;

  const _CardOverlay({
    required this.state,
    required this.notifier,
    required this.name,
    required this.avatar,
    required this.subtitle,
    required this.isVideo,
    required this.inCall,
  });

  @override
  Widget build(BuildContext context) {
    final phase = state.phase;
    return Container(
      color: Colors.black.withValues(alpha: 0.55),
      child: Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.88,
          constraints: const BoxConstraints(maxWidth: 380),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          decoration: BoxDecoration(
            color: AppTheme.surfaceColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE7DFC9)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _Avatar(avatar: avatar, name: name),
              const SizedBox(height: 20),
              Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.foregroundColor)),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (inCall && state.error == null) ...[
                    _QualityBars(quality: state.quality),
                    const SizedBox(width: 6),
                  ],
                  Flexible(
                    child: Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: state.error != null
                            ? AppTheme.dangerColor
                            : (phase == CallPhase.reconnecting ? AppTheme.warningColor : AppTheme.textSecondary),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(isVideo ? Icons.videocam : Icons.call, size: 12, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(isVideo ? 'مكالمة فيديو' : 'مكالمة صوتية', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
              if (inCall && state.peerMuted) ...[
                const SizedBox(height: 8),
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.mic_off, size: 13, color: AppTheme.textSecondary),
                    SizedBox(width: 4),
                    Text('الطرف الآخر كتم الميكروفون', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  ],
                ),
              ],
              const SizedBox(height: 28),
              _controls(context, phase),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _acceptCall(BuildContext context) async {
    final granted = await requestCallPermissions(isVideo ? CallType.video : CallType.audio);
    if (!granted) {
      notifier.rejectCall();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('يجب السماح بالوصول إلى الميكروفون لإجراء المكالمة')),
        );
      }
      return;
    }
    await notifier.acceptCall();
  }

  Widget _controls(BuildContext context, CallPhase phase) {
    if (phase == CallPhase.incoming) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _CallButton(icon: Icons.call_end, color: AppTheme.dangerColor, label: 'رفض', onPressed: notifier.rejectCall),
          const SizedBox(width: 24),
          _CallButton(
            icon: isVideo ? Icons.videocam : Icons.call,
            color: AppTheme.successColor,
            label: 'قبول',
            onPressed: () => _acceptCall(context),
          ),
        ],
      );
    }

    final showSpeaker = inCall;
    final showMute = phase == CallPhase.active ||
        phase == CallPhase.reconnecting ||
        phase == CallPhase.connecting ||
        phase == CallPhase.outgoing;
    final showEnd = phase != CallPhase.ended;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showSpeaker)
          _CallButton(
            icon: state.speakerOn ? Icons.volume_up : Icons.volume_off,
            color: state.speakerOn ? AppTheme.textSecondary : AppTheme.accentColor,
            background: const Color(0xFFEDE6D3),
            label: state.speakerOn ? 'مكبر الصوت' : 'كتم السماعة',
            onPressed: notifier.toggleSpeaker,
          ),
        if (showSpeaker && showMute) const SizedBox(width: 20),
        if (showMute)
          _CallButton(
            icon: state.muted ? Icons.mic_off : Icons.mic,
            color: state.muted ? AppTheme.accentColor : AppTheme.textSecondary,
            background: const Color(0xFFEDE6D3),
            label: state.muted ? 'إلغاء الكتم' : 'كتم',
            onPressed: notifier.toggleMute,
          ),
        if ((showSpeaker || showMute) && showEnd) const SizedBox(width: 20),
        if (showEnd)
          _CallButton(icon: Icons.call_end, color: AppTheme.dangerColor, label: 'إنهاء', onPressed: notifier.endCall),
      ],
    );
  }
}

/// Full-bleed video stage: remote feed fullscreen + self-preview PiP +
/// top meta bar + bottom control bar. Matches CallOverlay.tsx's video branch.
class _VideoStage extends StatelessWidget {
  final CallState state;
  final CallNotifier notifier;
  final String name;
  final String? avatar;
  final String subtitle;
  final int elapsed;
  final bool inCall;
  final bool remoteVideoLive;

  const _VideoStage({
    required this.state,
    required this.notifier,
    required this.name,
    required this.avatar,
    required this.subtitle,
    required this.elapsed,
    required this.inCall,
    required this.remoteVideoLive,
  });

  @override
  Widget build(BuildContext context) {
    final phase = state.phase;
    return Container(
      color: const Color(0xFF0B0B0B),
      child: Stack(
        children: [
          Positioned.fill(
            child: remoteVideoLive
                ? _RendererView(stream: state.remoteStream)
                : Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _Avatar(avatar: avatar, name: name, size: 112),
                        const SizedBox(height: 16),
                        Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (inCall && state.error == null) ...[
                              _QualityBars(quality: state.quality, inactiveColor: Colors.white24),
                              const SizedBox(width: 6),
                            ],
                            Text(
                              inCall && state.error == null
                                  ? (state.peerCameraOff ? 'أوقف الكاميرا' : 'في انتظار الفيديو…')
                                  : subtitle,
                              style: const TextStyle(fontSize: 13, color: Colors.white70),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0x8C000000), Colors.transparent],
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          const Icon(Icons.videocam, size: 15, color: Colors.white),
                          const SizedBox(width: 6),
                          Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                        ]),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (inCall) ...[_QualityBars(quality: state.quality, inactiveColor: Colors.white24), const SizedBox(width: 6)],
                            Text(
                              phase == CallPhase.active ? _fmt(elapsed) : (state.error ?? _kStatusText[phase] ?? 'مكالمة فيديو'),
                              style: TextStyle(fontSize: 12, color: phase == CallPhase.reconnecting ? AppTheme.warningColor : Colors.white70),
                            ),
                          ],
                        ),
                        if (inCall && state.peerMuted)
                          const Padding(
                            padding: EdgeInsets.only(top: 2),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.mic_off, size: 12, color: Colors.white70),
                              SizedBox(width: 4),
                              Text('الطرف الآخر كتم الميكروفون', style: TextStyle(fontSize: 11, color: Colors.white70)),
                            ]),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            top: 90,
            right: 16,
            width: 112,
            height: 160,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                color: const Color(0xFF1A1A1A),
                child: state.cameraOn && state.localStream != null
                    ? _RendererView(stream: state.localStream, mirror: true)
                    : const Center(child: Icon(Icons.videocam_off, color: Colors.white54)),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 48, 24, 32),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [Color(0x99000000), Colors.transparent],
                ),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _CallButton(
                      icon: state.muted ? Icons.mic_off : Icons.mic,
                      color: state.muted ? AppTheme.dangerColor : Colors.white,
                      background: state.muted ? null : Colors.white.withValues(alpha: 0.18),
                      label: state.muted ? 'إلغاء الكتم' : 'كتم',
                      onPressed: notifier.toggleMute,
                      dark: true,
                    ),
                    const SizedBox(width: 16),
                    _CallButton(
                      icon: state.cameraOn ? Icons.videocam : Icons.videocam_off,
                      color: Colors.white,
                      background: state.cameraOn ? Colors.white.withValues(alpha: 0.18) : AppTheme.dangerColor,
                      label: state.cameraOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا',
                      onPressed: notifier.toggleCamera,
                      dark: true,
                    ),
                    const SizedBox(width: 16),
                    _CallButton(
                      icon: state.speakerOn ? Icons.volume_up : Icons.volume_off,
                      color: Colors.white,
                      background: state.speakerOn ? Colors.white.withValues(alpha: 0.18) : AppTheme.dangerColor,
                      label: state.speakerOn ? 'مكبر الصوت' : 'كتم السماعة',
                      onPressed: notifier.toggleSpeaker,
                      dark: true,
                    ),
                    const SizedBox(width: 16),
                    _CallButton(icon: Icons.call_end, color: AppTheme.dangerColor, label: 'إنهاء', onPressed: notifier.endCall),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Binds a MediaStream to an RTCVideoRenderer for its lifetime -- flutter's
/// equivalent of web's imperative `<video>.srcObject = stream` StreamVideo helper.
class _RendererView extends StatefulWidget {
  final rtc.MediaStream? stream;
  final bool mirror;
  const _RendererView({required this.stream, this.mirror = false});

  @override
  State<_RendererView> createState() => _RendererViewState();
}

class _RendererViewState extends State<_RendererView> {
  final rtc.RTCVideoRenderer _renderer = rtc.RTCVideoRenderer();
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _renderer.initialize();
    _renderer.srcObject = widget.stream;
    if (mounted) setState(() => _ready = true);
  }

  @override
  void didUpdateWidget(covariant _RendererView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_ready && oldWidget.stream != widget.stream) {
      _renderer.srcObject = widget.stream;
    }
  }

  @override
  void dispose() {
    _renderer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) return const SizedBox.shrink();
    return rtc.RTCVideoView(
      _renderer,
      mirror: widget.mirror,
      objectFit: rtc.RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
    );
  }
}
