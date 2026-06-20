'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    profile?: { fullName?: string; avatarUrl?: string };
  };
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

function getNotificationIcon(type: string) {
  const cls = 'h-5 w-5';
  switch (type) {
    case 'friend_request':  return <User className={cls} />;
    case 'friend_accepted': return <CheckCircle className={cls} weight="fill" />;
    case 'like':            return <ThumbsUp className={cls} weight="fill" />;
    case 'comment':         return <ChatCircle className={cls} />;
    case 'tag':             return <Tag className={cls} />;
    case 'share':           return <ShareNetwork className={cls} />;
    case 'mention':         return <Megaphone className={cls} />;
    case 'birthday':        return <Cake className={cls} />;
    case 'group_invite':    return <Users className={cls} />;
    default:                return <Bell className={cls} />;
  }
}

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} ي`;
  return new Date(date).toLocaleDateString('ar-EG');
}

export function NotificationList({ notifications, onMarkAsRead, onMarkAllAsRead, onDelete }: NotificationListProps) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const handleClick = (n: Notification) => {
    if (!n.readStatus) onMarkAsRead(n.id);
    if (n.entityType === 'post' && n.entityId) router.push(`/posts/${n.entityId}`);
    else if (n.entityType === 'user' && n.entityId) router.push(`/profile/${n.entityId}`);
    else if (n.fromUser?.id) router.push(`/profile/${n.fromUser.id}`);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#213448]">الإشعارات</h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-[#547792] hover:text-[#213448] hover:underline transition-colors"
          >
            تعيين الكل كمقروء
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Bell size={32} className="text-[#94B4C1]" />
          <p className="text-sm text-[#547792]">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors group',
                n.readStatus
                  ? 'hover:bg-[#EAE0CF]/40'
                  : 'bg-[#D4E8EE]/50 hover:bg-[#D4E8EE]/80',
              )}
            >
              {/* Icon */}
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[#EAE0CF] shrink-0 text-[#547792] mt-0.5">
                {getNotificationIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm leading-snug',
                    n.readStatus ? 'text-[#547792]' : 'text-[#131F2E] font-medium',
                  )}
                >
                  {n.fromUser?.profile?.fullName ? (
                    <>
                      <span className="font-semibold">{n.fromUser.profile.fullName}</span>{' '}
                      {n.message}
                    </>
                  ) : (
                    n.message
                  )}
                </p>
                <p className="text-xs text-[#94B4C1] mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                {!n.readStatus && (
                  <div className="h-2 w-2 rounded-full bg-[#547792]" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                  className="text-[#BFB9AD] hover:text-red-400 p-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
