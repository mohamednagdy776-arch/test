import 'package:permission_handler/permission_handler.dart';
import '../../domain/entities/call_peer.dart';

/// Requests mic (+ camera for video calls) permission before starting or
/// accepting a call. flutter_webrtc's getUserMedia() does NOT prompt for
/// runtime permission on Android/iOS itself -- it simply fails if the OS
/// hasn't granted it yet, so this must run first.
Future<bool> requestCallPermissions(CallType type) async {
  final permissions = <Permission>[
    Permission.microphone,
    if (type == CallType.video) Permission.camera,
  ];
  final statuses = await permissions.request();
  return statuses.values.every((s) => s.isGranted);
}
