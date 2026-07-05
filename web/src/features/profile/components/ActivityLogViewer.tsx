'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Props {
  userId: string;
}

const activityIcons: Record<string, string> = {
  post: '✍️',
  like: '❤️',
  comment: '💬',
  tag: '🏷️',
  friend_add: '👋',
  photo: '📷',
  video: '🎬',
};

export const ActivityLogViewer = ({ userId }: Props) => {
  const [year, setYear] = useState<string>('');
  const [type, setType] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['activity-log', userId, { year, type }],
    queryFn: () => {
      // Only send filters that are actually set — sending empty year/type made
      // the backend 400 (empty `type` failed enum validation), breaking the
      // whole tab (#832).
      const params: Record<string, string> = {};
      if (year) params.year = year;
      if (type) params.type = type;
      return apiClient.get(`/users/${userId}/activity`, { params }).then((r) => r.data);
    },
    enabled: !!userId,
  });

  const activities = (data as any)?.data?.data || [];

  // Years that actually have activity (from the backend, computed off the
  // real merged activity set) — this used to be a hardcoded 2024-through-now
  // range regardless of real data, always offering empty years (#117).
  const years: number[] = (data as any)?.data?.availableYears || [];

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-xl bg-[var(--card)] p-6 space-y-4">
      <div className="flex gap-4 flex-wrap">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
        >
          <option value="">كل السنوات</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
        >
          <option value="">كل الأنشطة</option>
          <option value="post">منشورات</option>
          <option value="like">إعجابات</option>
          <option value="comment">تعليقات</option>
          <option value="tag">وسوم</option>
          <option value="friend_add">إضافة أصدقاء</option>
          <option value="photo">صور</option>
          <option value="video">فيديوهات</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-center text-[var(--muted-foreground)]">جاري التحميل...</p>
      ) : activities.length === 0 ? (
        <p className="text-center text-[var(--muted-foreground)]">لا يوجد نشاط</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: any, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)] hover:bg-[var(--muted)] transition-colors"
            >
              <span className="text-xl">{activityIcons[activity.type] || '📌'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">{activity.description}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatDate(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
