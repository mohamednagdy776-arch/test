'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  UserPlus, CheckCircle, Heart, ChatCircle, Tag, ShareNetwork,
  Megaphone, Cake, UsersThree, Bell, X, UserCircle,
} from '@phosphor-icons/react';

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

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; fg: string }> = {
  friend_request:  { icon: UserPlus,     bg: 'bg-blue-100',   fg: 'text-blue-600'   },
  friend_accepted: { icon: CheckCircle,  bg: 'bg-green-100',  fg: 'text-green-600'  },
  like:            { icon: Heart,        bg: 'bg-red-100',    fg: 'text-red-500'    },
  comment:         { icon: ChatCircle,   bg: 'bg-sky-100',    fg: 'text-sky-600'    },
  tag:             { icon: Tag,          bg: 'bg-orange-100', fg: 'text-orange-500' },
  share:           { icon: ShareNetwork, bg: 'bg-purple-100', fg: 'text-purple-600' },
  mention:         { icon: Megaphone,    bg: 'bg-yellow-100', fg: 'text-yellow-600' },
  birthday:        { icon: Cake,         bg: 'bg-pink-100',   fg: 'text-pink-500'   },
  group_invite:    { icon: UsersThree,   bg: 'bg-teal-100',   fg: 'text-teal-600'   },
};
const DEFAULT_TYPE = { icon: Bell, bg: 'bg-[var(--muted)]', fg: 'text-[var(--muted-foreground)]' };

function NotifIcon({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? DEFAULT_TYPE;
  const Icon = cfg.icon;
  const isDefault = !(type in TYPE_CONFIG);
  return (
    <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', cfg.bg)}>
      <Icon size={18} weight={isDefault ? 'regular' : 'fill'} className={cfg.fg} />
    </div>
  );
}

function SenderAvatar({ fromUser }: { fromUser?: Notification['fromUser'] }) {
  const name = fromUser?.profile?.fullName || '';
  const avatar = fromUser?.profile?.avatarUrl;
  const initial = name.charAt(0).toUpperCase() || '?';

  return avatar ? (
    <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--muted)] to-[var(--muted-foreground)] flex items-center justify-center shrink-0">
      {initial !== '?' ? (
        <span className="text-sm font-bold text-[var(--foreground)]">{initial}</span>
      ) : (
        <UserCircle size={20} className="text-[var(--muted-foreground)]" />
      )}
    </div>
  );
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

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const groups: { label: string; items: Notification[] }[] = [
    { label: 'اليوم', items: [] },
    { label: 'الأمس', items: [] },
    { label: 'هذا الأسبوع', items: [] },
    { label: 'أقدم', items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (d >= today) groups[0].items.push(n);
    else if (d >= yesterday) groups[1].items.push(n);
    else if (d >= weekAgo) groups[2].items.push(n);
    else groups[3].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function NotificationList({ notifications, onMarkAsRead, onMarkAllAsRead, onDelete }: NotificationListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;
  const groups = groupByDate(notifications);

  const handleClick = (n: Notification) => {
    if (!n.readStatus) onMarkAsRead(n.id);
    if (n.entityType === 'post' && n.entityId) router.push(`/posts/${n.entityId}`);
    else if (n.entityType === 'user' && n.entityId) router.push(`/profile/${n.entityId}`);
    else if (n.fromUser?.id) router.push(`/profile/${n.fromUser.id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border)]/40">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[var(--foreground)]">الإشعارات</h2>
          {unreadCount > 0 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-[var(--primary)] text-[var(--card)] text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            قراءة الكل
          </button>
        )}
      </div>

      {/* Body */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-14 w-14 rounded-2xl bg-[var(--muted)]/60 flex items-center justify-center">
            <Bell size={28} className="text-[var(--muted-foreground)]" />
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="py-2">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-4 py-1.5 text-[11px] font-semibold text-[var(--foreground)]/50 uppercase tracking-wide">
                {group.label}
              </p>
              {group.items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group',
                    'hover:bg-[var(--muted)]/30',
                    !n.readStatus && 'bg-[var(--muted)]/30',
                  )}
                >
                  {/* Unread accent bar */}
                  {!n.readStatus && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-[var(--muted-foreground)]" />
                  )}

                  {/* Avatar + Icon overlay */}
                  <div className="relative mt-0.5">
                    <SenderAvatar fromUser={n.fromUser} />
                    <div className="absolute -bottom-1 -left-1">
                      <NotifIcon type={n.type} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <p className={cn('text-sm leading-snug text-[var(--foreground)]', !n.readStatus && 'font-medium')}>
                      {n.fromUser?.profile?.fullName ? (
                        <>
                          <span className="font-semibold">{n.fromUser.profile.fullName}</span>{' '}
                          {n.message}
                        </>
                      ) : (
                        n.message
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(n.id);
                      onDelete(n.id);
                    }}
                    disabled={deletingId === n.id}
                    aria-label="حذف الإشعار"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-50 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingId === n.id ? (
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <X size={13} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
