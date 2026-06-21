'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from '@phosphor-icons/react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-[var(--muted)]/50 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell size={22} weight={isOpen ? 'fill' : 'regular'} className="text-[var(--muted-foreground)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-96 max-h-[80vh] flex flex-col bg-[var(--card)] rounded-2xl shadow-[0_8px_40px_rgba(19,31,46,0.16)] border border-[var(--border)]/60 z-50 overflow-hidden animate-scale-in"
          style={{ transformOrigin: 'top left' }}
        >
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <NotificationPanel onClose={() => setIsOpen(false)} />
          </div>
          <div className="border-t border-[var(--border)]/40 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              عرض كل الإشعارات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const { refetch: refetchUnread } = useUnreadCount();

  const notifications = Array.isArray(data?.data) ? data.data : [];

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
    refetchUnread();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    refetchUnread();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification.mutateAsync(id);
    refetchUnread();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-[var(--muted-foreground)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[var(--muted-foreground)]">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <NotificationList
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
    />
  );
}
