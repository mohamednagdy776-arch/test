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
    queryFn: () => apiClient.get(`/users/${userId}/activity`, { params: { year, type } }).then((r) => r.data),
    enabled: !!userId,
  });

  const activities = (data as any)?.data?.data || [];

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
    <div className="rounded-xl bg-white p-6 space-y-4">
      <div className="flex gap-4 flex-wrap">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">كل السنوات</option>
          {[2026, 2025, 2024, 2023].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
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
        <p className="text-center text-gray-500">جاري التحميل...</p>
      ) : activities.length === 0 ? (
        <p className="text-center text-gray-400">لا يوجد نشاط</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: any, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">{activityIcons[activity.type] || '📌'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
