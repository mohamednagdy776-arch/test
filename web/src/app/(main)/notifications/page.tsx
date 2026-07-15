'use client';
import { useState } from 'react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/features/notifications/hooks';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { usePushNotifications } from '@/features/notifications/usePushNotifications';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Bell, Checks } from '@phosphor-icons/react';
import { useT } from '@/i18n/I18nProvider';

type Tab = 'all' | 'unread' | 'mentions' | 'likes' | 'comments';

export default function NotificationsPage() {
  const { t } = useT();
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

  const allNotifications: any[] = data?.data ?? [];
  const unreadCount = unreadData?.data?.count ?? 0;
  // If the server filled the page, there are probably more to load.
  const hasMore = allNotifications.length >= limit;

  // Server-side type filter handles likes/comments/mentions; unread is client-side only.
  const filtered = activeTab === 'unread' ? allNotifications.filter((n) => !n.readStatus) : allNotifications;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: t('notifications.tabAll'), count: allNotifications.length },
    { id: 'unread', label: t('notifications.tabUnread'), count: unreadCount },
    { id: 'likes', label: t('notifications.tabLikes') },
    { id: 'comments', label: t('notifications.tabComments') },
    { id: 'mentions', label: t('notifications.tabMentions') },
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          icon={Bell}
          eyebrow={t('notifications.eyebrow')}
          title={t('nav.notifications')}
          subtitle={t('notifications.subtitle')}
          action={unreadCount > 0 ? (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Checks size={15} weight="bold" />
              {t('notifications.markAllRead')}
            </button>
          ) : undefined}
        />

        <div className="flex gap-2 border-b border-[var(--border)] pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[var(--primary)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[var(--muted)] text-[var(--primary)] text-[10px] font-bold">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg shadow-black/5 p-4">
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
                    className="px-5 py-2 text-sm font-medium text-[var(--primary)] rounded-full border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                  >
                    {t('notifications.loadMore')}
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
