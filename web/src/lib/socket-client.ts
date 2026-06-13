import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** Read a cookie value by name (browser only). */
const readBrowserCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

/**
 * Current user id. The JWT now lives in an HttpOnly cookie (unreadable by JS),
 * so we read the non-sensitive `uid` cookie the backend sets alongside it.
 */
export const getCurrentUserId = (): string | null => readBrowserCookie('uid');

export const getSocket = (): Socket => {
  if (!socket) {
    const userId = getCurrentUserId();
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
      // The auth cookie is sent with the handshake; the gateway reads the JWT
      // from it. We no longer have the token in JS to put in `auth`.
      withCredentials: true,
      query: userId ? { userId } : {},
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
