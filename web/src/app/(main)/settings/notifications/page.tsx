'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'notifications_enabled',
    label: 'إشعارات التطبيق',
    description: 'تلقي الإشعارات من الأنشطة الجديدة',
    icon: '🔔',
  },
  {
    key: 'likes_notifications',
    label: 'إشعارات الإعجابات',
    description: 'الإشعار عندما يعجب منشور لك',
    icon: '❤️',
  },
  {
    key: 'comments_notifications',
    label: 'إشعارات التعليقات',
    description: 'الإشعار على تعليقات منشوراتك',
    icon: '💬',
  },
  {
    key: 'friend_requests_notifications',
    label: 'إشعارات طلبات الصداقة',
    description: 'الإشعار عند استلام طلب صداقة جديد',
    icon: '🤝',
  },
  {
    key: 'messages_notifications',
    label: 'إشعارات الرسائل',
    description: 'الإشعار عند استلام رسالة جديدة',
    icon: '✉️',
  },
  {
    key: 'mentions_notifications',
    label: 'إشعارات الإشارة',
    description: 'الإشعار عندما يذكرك شخص ما',
    icon: '📢',
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

  const ToggleSwitch = ({ enabled, onClick, disabled }: { enabled: boolean; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled ? 'bg-emerald-500 shadow-inner' : 'bg-sage-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          enabled ? 'right-8' : 'right-1'
        }`}
      />
    </button>
  );

  const SettingRow = ({ setting }: { setting: NotificationSetting }) => {
    const isDisabled = setting.key !== 'notifications_enabled' && !settings.notifications_enabled;
    return (
      <div
        className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
          isDisabled
            ? 'bg-sage-50/50 border-sage-200/50 opacity-60'
            : 'bg-white/50 border-emerald-100/50 hover:border-emerald-200'
        }`}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">
            {setting.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-900">{setting.label}</h3>
            <p className="text-emerald-700/70 text-sm mt-0.5">{setting.description}</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={settings[setting.key]}
          onClick={() => handleToggle(setting.key)}
          disabled={isDisabled}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">الإشعارات</h1>
          <p className="text-emerald-700/70 mt-2">تحكم في الإشعارات التي تستلمها</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>🔔</span> إعدادات الإشعارات
            </CardTitle>
            <CardDescription>
              {enabledCount} من {NOTIFICATION_SETTINGS.length} مفعلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {NOTIFICATION_SETTINGS.map((setting) => (
                <SettingRow key={setting.key} setting={setting} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>📧</span> البريد الإلكتروني
            </CardTitle>
            <CardDescription>تلقي الإشعارات عبر البريد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between p-4 rounded-xl bg-white/50 border border-emerald-100/50">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg">
                  📧
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">إشعارات البريد الإلكتروني</h3>
                  <p className="text-emerald-700/70 text-sm mt-0.5">تلقي التحديثات عبر البريد</p>
                </div>
              </div>
              <button className="relative w-14 h-7 rounded-full bg-sage-300">
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}