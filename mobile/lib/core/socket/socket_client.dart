import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/app_constants.dart';

// Thin wrapper around a single shared Socket.IO connection. Auth handshake
// matches web/src/lib/socket-client.ts + backend/src/chat/chat.gateway.ts's
// handleConnection: JWT via `auth: {token}`. Only registers the events this
// app actually handles (newMessage, userTyping, messageSeen) -- deliberately
// does NOT touch the WebRTC call:* signalling events at all (voice/video
// calls are backlog); an unregistered event is simply never delivered to
// a listener, so there's nothing to "ignore" defensively here.
class SocketClient {
  static const _storage = FlutterSecureStorage();
  static io.Socket? _socket;

  static Future<io.Socket> connect() async {
    if (_socket != null && _socket!.connected) return _socket!;

    final token = await _storage.read(key: 'access_token');
    _socket = io.io(
      AppConstants.wsUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );
    _socket!.connect();
    return _socket!;
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
