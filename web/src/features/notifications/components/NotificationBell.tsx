'use client';
import { useState } from 'react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  
  const unreadCount = unreadData?.data?.count || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[#EAE0CF]/50 transition-colors"
      >
        <svg className="h-6 w-6 text-[#547792]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] overflow-y-auto bg-[#FDFAF5] rounded-2xl shadow-lg border border-[#C8D8DF]/60 z-50 animate-scale-in">
            <NotificationPanel onClose={() => setIsOpen(false)} />
          </div>
        </>
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

  const notifications = data?.data?.notifications || [];

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
      <div className="p-4 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#547792] border-t-transparent rounded-full animate-spin" />
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
