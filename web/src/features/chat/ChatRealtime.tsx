'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, getCurrentUserId } from '@/lib/socket-client';
import { useToast } from '@/components/ui/Toast';

/**
 * App-wide chat realtime listener (#6).
 *
 * Mounted once in the authenticated layout so the Socket.IO connection is
 * established for every logged-in user — not only while the chat page is open.
 * The backend relays each new message to the recipient's own sockets
 * (`newMessageNotification`), so messages, unread counts and badges update in
 * real time regardless of which screen the recipient is on. When they are not
 * already viewing that conversation we also surface a lightweight toast.
 */
export function ChatRealtime() {
  const qc = useQueryClient();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    const me = getCurrentUserId();
    if (!me) return;

    const socket = getSocket();

    const onNewMessage = (msg: any) => {
      if (!msg || msg.senderId === me) return;
      // Refresh the conversation list (last-message/order) and the unread badge.
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['chat-unread'] });
      // Don't toast if the user is already on the chat screen for this thread.
      const onThisChat = pathname?.startsWith('/chat');
      if (!onThisChat) {
        showToast?.('لديك رسالة جديدة', 'info');
      }
    };

    socket.on('newMessageNotification', onNewMessage);
    return () => {
      socket.off('newMessageNotification', onNewMessage);
    };
  }, [qc, pathname, showToast]);

  return null;
}
