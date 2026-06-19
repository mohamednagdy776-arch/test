'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { User, CheckCircle, ThumbsUp, ChatCircle, Tag, ShareNetwork, Megaphone, Cake, Users, Bell, X } from '@phosphor-icons/react';

interface Notification {
  id: string;
  type: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
  fromUser?: {
    id: string;
    profile?: { fullName?: string; avatar?: string };
  };
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const ITEM_HEIGHT = 72;
const OVERSCAN = 3;
// Use viewport-relative height so the list doesn't overflow on short mobile screens
const getContainerHeight = () =>
  typeof window !== 'undefined' ? Math.min(560, window.innerHeight - 220) : 560;

function getNotificationIcon(type: string) {
  switch (type) {
    case 'friend_request': return <User size={20} />;
    case 'friend_accepted': return <CheckCircle size={20} weight="fill" />;
    case 'like': return <ThumbsUp size={20} weight="fill" />;
    case 'comment': return <ChatCircle size={20} />;
    case 'tag': return <Tag size={20} />;
    case 'share': return <ShareNetwork size={20} />;
    case 'mention': return <Megaphone size={20} />;
    case 'birthday': return <Cake size={20} />;
    case 'group_invite': return <Users size={20} />;
    default: return <Bell size={20} />;
  }
}

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ي`;
  return new Date(date).toLocaleDateString('ar-EG');
}

export function NotificationList({ notifications, onMarkAsRead, onMarkAllAsRead, onDelete }: NotificationListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const containerHeight = getContainerHeight();
  const totalHeight = notifications.length * ITEM_HEIGHT;
  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(notifications.length - 1, startIndex + visibleCount + OVERSCAN * 2);

  const visibleNotifications = notifications.slice(startIndex, endIndex + 1);
  const paddingTop = startIndex * ITEM_HEIGHT;
  const paddingBottom = Math.max(0, (notifications.length - endIndex - 1) * ITEM_HEIGHT);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#213448]">الإشعارات</h2>
        {unreadCount > 0 && (
          <button onClick={onMarkAllAsRead} className="text-sm text-[#547792] hover:underline">
            تعيين الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Bell size={32} className="text-[#94B4C1] mb-2" />
          <p className="text-sm text-[#547792]">لا توجد إشعارات</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{ height: `${containerHeight}px`, overflowY: 'auto' }}
          className="relative"
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div style={{ paddingTop, paddingBottom }}>
              <div className="space-y-2">
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                    onClick={() => {
                      if (!notification.readStatus) {
                        onMarkAsRead(notification.id);
                      }
                      if (notification.entityType === 'post' && notification.entityId) {
                        router.push(`/posts/${notification.entityId}`);
                        return;
                      }
                      setExpandedId(expandedId === notification.id ? null : notification.id);
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all",
                      notification.readStatus
                        ? "hover:bg-[#EAE0CF]/30"
                        : "bg-[#D4E8EE]/50 hover:bg-[#D4E8EE]"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#EAE0CF] shrink-0 text-[#547792]">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {notification.fromUser?.id ? (
                        <Link
                          href={`/profile/${notification.fromUser.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "text-sm hover:underline",
                            notification.readStatus ? "text-[#547792]" : "text-[#131F2E] font-medium"
                          )}
                        >
                          {notification.message}
                        </Link>
                      ) : (
                        <p className={cn(
                          "text-sm",
                          notification.readStatus ? "text-[#547792]" : "text-[#131F2E] font-medium"
                        )}>
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-[#547792] mt-1">{timeAgo(notification.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.readStatus && (
                        <div className="h-2 w-2 rounded-full bg-[#547792]" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                        className="text-[#547792] hover:text-red-500 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
