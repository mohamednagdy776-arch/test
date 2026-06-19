'use client';
import { useState } from 'react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/features/notifications/hooks';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { usePushNotifications } from '@/features/notifications/usePushNotifications';
import { Spinner } from '@/components/ui/Spinner';

type Tab = 'all' | 'unread' | 'mentions' | 'likes' | 'comments';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  usePushNotifications();
  // Load-more pagination: bump the page size on demand instead of being stuck
  // on the first 20 with no way to see older notifications (#451).
  const [limit, setLimit] = useState(20);
  const serverType = activeTab === 'likes' ? 'like' : activeTab === 'comments' ? 'comment' : activeTab === 'mentions' ? 'mention' : undefined;
  const { data, isLoading } = useNotifications(1, limit, serverType);
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const allNotifications: any[] = data?.data?.notifications ?? [];
  const unreadCount = unreadData?.data?.count ?? 0;
  // If the server filled the page, there are probably more to load.
  const hasMore = allNotifications.length >= limit;

  // Server-side type filter handles likes/comments/mentions; unread is client-side only.
  const filtered = activeTab === 'unread' ? allNotifications.filter((n) => !n.readStatus) : allNotifications;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: 'الكل', count: allNotifications.length },
    { id: 'unread', label: 'غير مقروء', count: unreadCount },
    { id: 'likes', label: 'الإعجابات' },
    { id: 'comments', label: 'التعليقات' },
    { id: 'mentions', label: 'الإشارات' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-amber-50/30 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-emerald-900">الإشعارات</h1>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50"
            >
              تعيين الكل كمقروء
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b border-emerald-100 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
                activeTab === tab.id
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-emerald-500 hover:text-emerald-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white/80 border border-emerald-100 shadow-lg shadow-emerald-500/10 p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <>
              <NotificationList
                notifications={filtered}
                onMarkAsRead={(id) => markAsRead.mutate(id)}
                onMarkAllAsRead={() => markAllAsRead.mutate()}
                onDelete={(id) => deleteNotification.mutate(id)}
              />
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setLimit((l) => l + 20)}
                    className="px-5 py-2 text-sm font-medium text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-50 transition-colors"
                  >
                    تحميل المزيد
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
