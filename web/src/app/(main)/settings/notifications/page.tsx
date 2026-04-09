'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'notifications_enabled',
    label: 'إشعارات التطبيق',
    description: 'تلقي الإشعارات من الأنشطة الجديدة',
  },
  {
    key: 'likes_notifications',
    label: 'إشعارات الإعجابات',
    description: 'الإشعار عندما يعجب منشور لك',
  },
  {
    key: 'comments_notifications',
    label: 'إشعارات التعليقات',
    description: 'الإشعار على تعليقات منشوراتك',
  },
  {
    key: 'friend_requests_notifications',
    label: 'إشعارات طلبات الصداقة',
    description: 'الإشعار عند استلام طلب صداقة جديد',
  },
  {
    key: 'messages_notifications',
    label: 'إشعارات الرسائل',
    description: 'الإشعار عند استلام رسالة جديدة',
  },
  {
    key: 'mentions_notifications',
    label: 'إشعارات الإشارة',
    description: 'الإشعار عندما يذكرك شخص ما',
  },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    notifications_enabled: true,
    likes_notifications: true,
    comments_notifications: true,
    friend_requests_notifications: true,
    messages_notifications: true,
    mentions_notifications: true,
  });

  const handleToggle = (key: string) => {
    if (key === 'notifications_enabled') {
      const newValue = !settings.notifications_enabled;
      setSettings(prev => {
        const updated = { ...prev, [key]: newValue };
        if (!newValue) {
          Object.keys(updated).forEach(k => {
            if (k !== 'notifications_enabled') (updated as any)[k] = false;
          });
        }
        return updated;
      });
    } else {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const allEnabled = settings.notifications_enabled;
  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
          ← الإعدادات
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#213448]">الإشعارات</h1>
        <p className="text-sm text-[#547792] mt-1">تحكم في الإشعارات التي تريد استلامها</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🔔</span> إعدادات الإشعارات
          </CardTitle>
          <CardDescription>
            {enabledCount} من {NOTIFICATION_SETTINGS.length} مفعلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_SETTINGS.map((setting) => (
              <div
                key={setting.key}
                className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${
                  setting.key !== 'notifications_enabled' && !settings.notifications_enabled
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-[#FDFAF5] border-[#C8D8DF]/60'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-[#213448]">{setting.label}</h3>
                  <p className="text-sm text-[#547792] mt-0.5">{setting.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(setting.key)}
                  disabled={setting.key !== 'notifications_enabled' && !settings.notifications_enabled}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings[setting.key] ? 'bg-[#4A8C6F]' : 'bg-[#C8D8DF]'
                  } ${setting.key !== 'notifications_enabled' && !settings.notifications_enabled ? 'cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings[setting.key] ? 'right-7' : 'right-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>📧</span> البريد الإلكتروني
          </CardTitle>
          <CardDescription>تلقي الإشعارات عبر البريد الإلكتروني</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
            <div className="flex-1">
              <h3 className="font-semibold text-[#213448]">إشعارات البريد الإلكتروني</h3>
              <p className="text-sm text-[#547792] mt-0.5">تلقي التحديثات المهمة عبر البريد الإلكتروني</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-[#C8D8DF]">
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}