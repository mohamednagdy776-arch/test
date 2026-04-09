'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
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

function getNotificationIcon(type: string) {
  switch (type) {
    case 'friend_request': return '👤';
    case 'friend_accepted': return '✅';
    case 'like': return '👍';
    case 'comment': return '💬';
    case 'tag': return '🏷️';
    case 'share': return '📤';
    case 'mention': return '📢';
    case 'birthday': return '🎂';
    case 'group_invite': return '👥';
    default: return '🔔';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const unreadCount = notifications.filter(n => !n.readStatus).length;

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
          <p className="text-4xl mb-2">🔔</p>
          <p className="text-sm text-[#547792]">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.readStatus) {
                  onMarkAsRead(notification.id);
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
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-xl bg-[#EAE0CF] shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm",
                  notification.readStatus ? "text-[#547792]" : "text-[#131F2E] font-medium"
                )}>
                  {notification.message}
                </p>
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
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
