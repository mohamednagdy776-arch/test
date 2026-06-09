import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** Decode the `sub` (user id) claim from the stored JWT, without verifying it. */
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.sub ?? null;
  } catch {
    return null;
  }
};

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const userId = getCurrentUserId();
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
      auth: { token },
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
