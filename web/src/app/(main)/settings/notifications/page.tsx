'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotificationSettings, useUpdateNotificationSettings, useNewsletterSettings, useUpdateNewsletterSettings } from '@/features/settings/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'likesNotifications',
    label: 'إشعارات الإعجابات',
    description: 'الإشعار عندما يعجب منشور لك',
    icon: '❤️',
  },
  {
    key: 'commentsNotifications',
    label: 'إشعارات التعليقات',
    description: 'الإشعار على تعليقات منشوراتك',
    icon: '💬',
  },
  {
    key: 'friendRequestsNotifications',
    label: 'إشعارات طلبات الصداقة',
    description: 'الإشعار عند استلام طلب صداقة جديد',
    icon: '🤝',
  },
  {
    key: 'messagesNotifications',
    label: 'إشعارات الرسائل',
    description: 'الإشعار عند استلام رسالة جديدة',
    icon: '✉️',
  },
  {
    key: 'mentionsNotifications',
    label: 'إشعارات الإشارة',
    description: 'الإشعار عندما يذكرك شخص ما',
    icon: '📢',
  },
];

const NEWSLETTER_SETTINGS = [
  {
    key: 'weeklyDigest',
    label: 'الملخص الأسبوعي',
    description: 'تلقي ملخص أسبوعي بالنشاطات',
    icon: '📰',
  },
  {
    key: 'newFeaturesUpdates',
    label: 'تحديثات الميزات الجديدة',
    description: 'الإشعار عند إضافة ميزات جديدة',
    icon: '✨',
  },
  {
    key: 'promotionsOffers',
    label: 'العروض والخصومات',
    description: 'تلقي معلومات عن العروض الخاصة',
    icon: '🎁',
  },
  {
    key: 'eventsAndCommunities',
    label: 'الفعاليات والمجتمعات',
    description: 'الإشعار عن الفعاليات القادمة',
    icon: '📅',
  },
  {
    key: 'securityAlerts',
    label: 'تنبيهات الأمان',
    description: 'الإشعار عند اكتشاف نشاط مشبوه',
    icon: '🛡️',
  },
];

export default function NotificationsPage() {
  const { data: notificationData, isLoading: notificationLoading } = useNotificationSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();
  const { data: newsletterData, isLoading: newsletterLoading } = useNewsletterSettings();
  const updateNewsletterSettings = useUpdateNewsletterSettings();

  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    likesNotifications: true,
    commentsNotifications: true,
    friendRequestsNotifications: true,
    messagesNotifications: true,
    mentionsNotifications: true,
  });

  const [newsletterSettings, setNewsletterSettings] = useState<Record<string, boolean>>({
    weeklyDigest: true,
    newFeaturesUpdates: true,
    promotionsOffers: false,
    eventsAndCommunities: true,
    securityAlerts: true,
  });

  const [masterNotificationsEnabled, setMasterNotificationsEnabled] = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);

  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (notificationData?.data) {
      const data = notificationData.data;
      setNotificationSettings({
        likesNotifications: data.likesNotifications ?? true,
        commentsNotifications: data.commentsNotifications ?? true,
        friendRequestsNotifications: data.friendRequestsNotifications ?? true,
        messagesNotifications: data.messagesNotifications ?? true,
        mentionsNotifications: data.mentionsNotifications ?? true,
      });
      setMasterNotificationsEnabled(data.notificationsEnabled ?? true);
    }
  }, [notificationData]);

  useEffect(() => {
    if (newsletterData?.data) {
      const data = newsletterData.data;
      setNewsletterSettings({
        weeklyDigest: data.weeklyDigest ?? true,
        newFeaturesUpdates: data.newFeaturesUpdates ?? true,
        promotionsOffers: data.promotionsOffers ?? false,
        eventsAndCommunities: data.eventsAndCommunities ?? true,
        securityAlerts: data.securityAlerts ?? true,
      });
      setNewsletterEnabled(data.newsletterEnabled ?? true);
    }
  }, [newsletterData]);

  const handleNotificationToggle = async (key: string) => {
    const newValue = !notificationSettings[key];
    setNotificationSettings(prev => ({ ...prev, [key]: newValue }));
    setSavingNotifications(true);
    try {
      await updateNotificationSettings.mutateAsync({ [key]: newValue });
      setMessage({ type: 'success', text: 'تم حفظ الإعدادات' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'فشل في حفظ الإعدادات' });
    } finally {
      setSavingNotifications(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleMasterToggle = async () => {
    const newValue = !masterNotificationsEnabled;
    setMasterNotificationsEnabled(newValue);
    setSavingNotifications(true);
    try {
      await updateNotificationSettings.mutateAsync({ notificationsEnabled: newValue });
      setMessage({ type: 'success', text: newValue ? 'تم تفعيل الإشعارات' : 'تم تعطيل الإشعارات' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'فشل في حفظ الإعدادات' });
    } finally {
      setSavingNotifications(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleNewsletterToggle = async () => {
    const newValue = !newsletterEnabled;
    setNewsletterEnabled(newValue);
    setSavingNewsletter(true);
    try {
      await updateNewsletterSettings.mutateAsync({ newsletterEnabled: newValue });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'فشل في حفظ الإعدادات' });
    } finally {
      setSavingNewsletter(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleNewsletterItemToggle = async (key: string) => {
    const newValue = !newsletterSettings[key];
    setNewsletterSettings(prev => ({ ...prev, [key]: newValue }));
    setSavingNewsletter(true);
    try {
      await updateNewsletterSettings.mutateAsync({ [key]: newValue });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'فشل في حفظ الإعدادات' });
    } finally {
      setSavingNewsletter(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const isLoading = notificationLoading || newsletterLoading;

  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
  };

  const ToggleSwitch = ({ enabled, onClick, disabled, label }: { enabled: boolean; onClick: () => void; disabled?: boolean; label?: string }) => (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">الإشعارات</h1>
          <p className="text-emerald-700/70 mt-2">تحكم في الإشعارات التي تستلمها</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {pushPermission !== null && pushPermission !== 'granted' && (
          <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-emerald-900">إشعارات المتصفح</h3>
                <p className="text-sm text-emerald-700/70 mt-0.5">
                  {pushPermission === 'denied'
                    ? 'الإشعارات محظورة في إعدادات المتصفح — يرجى إلغاء الحظر يدوياً'
                    : 'اسمح بالإشعارات لتلقّي تنبيهات فورية حتى عندما لا يكون التطبيق مفتوحاً'}
                </p>
              </div>
              {pushPermission === 'default' && (
                <button
                  onClick={requestPushPermission}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all"
                >
                  السماح
                </button>
              )}
            </CardContent>
          </Card>
        )}

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>🔔</span> إعدادات الإشعارات
            </CardTitle>
            <CardDescription>
              إدارة جميع إشعارات التطبيق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">
                    🔔
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">جميع الإشعارات</h3>
                    <p className="text-emerald-700/70 text-sm">تفعيل/تعطيل جميع الإشعارات</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={masterNotificationsEnabled}
                  onClick={handleMasterToggle}
                  label="جميع الإشعارات"
                />
              </div>

              <div className="border-t border-emerald-200/50 pt-3 mt-3">
                <p className="text-sm text-emerald-700/70 mb-3">إعدادات محددة</p>
                {NOTIFICATION_SETTINGS.map((setting) => (
                  <div
                    key={setting.key}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                      !masterNotificationsEnabled
                        ? 'bg-sage-50/50 border-sage-200/50 opacity-60'
                        : 'bg-white/50 border-emerald-100/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">
                        {setting.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-900 text-sm">{setting.label}</h3>
                        <p className="text-emerald-700/70 text-xs mt-0.5">{setting.description}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={notificationSettings[setting.key] || false}
                      onClick={() => handleNotificationToggle(setting.key)}
                      disabled={!masterNotificationsEnabled}
                      label={setting.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>📧</span> النشرة البريدية
            </CardTitle>
            <CardDescription>
              إدارة الاشتراك في النشرة البريدية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg">
                    📧
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">النشرة البريدية</h3>
                    <p className="text-emerald-700/70 text-sm">تلقي التحديثات عبر البريد الإلكتروني</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={newsletterEnabled}
                  onClick={handleNewsletterToggle}
                />
              </div>

              {newsletterEnabled && (
                <div className="border-t border-emerald-200/50 pt-3 mt-3 space-y-2">
                  {NEWSLETTER_SETTINGS.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-start justify-between p-3 rounded-xl bg-white/50 border border-emerald-100/50"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-sm">
                          {setting.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-900 text-sm">{setting.label}</h3>
                          <p className="text-emerald-700/70 text-xs mt-0.5">{setting.description}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={newsletterSettings[setting.key] || false}
                        onClick={() => handleNewsletterItemToggle(setting.key)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
