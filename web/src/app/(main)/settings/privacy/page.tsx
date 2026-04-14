'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePrivacySettings, useUpdatePrivacySettings, useBlocks, useUnblockUser } from '@/features/settings/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'العام' },
  { value: 'friends', label: 'الأصدقاء' },
  { value: 'friends_of_friends', label: 'أصدقاء الأصدقاء' },
  { value: 'only_me', label: 'أنا فقط' },
];

interface PrivacyField {
  key: string;
  label: string;
  description: string;
  options: typeof VISIBILITY_OPTIONS;
}

const PRIVACY_FIELDS: PrivacyField[] = [
  {
    key: 'whoCanSeePosts',
    label: 'من يمكنه رؤية منشوراتك',
    description: 'هذه الإعدادات ستطبق على منشوراتك الجديدة',
    options: VISIBILITY_OPTIONS.filter(o => o.value !== 'only_me'),
  },
  {
    key: 'whoCanSeeFriends',
    label: 'من يمكنه رؤية قائمة أصدقائك',
    description: 'حدد من يمكنه رؤية أصدقائك',
    options: VISIBILITY_OPTIONS,
  },
  {
    key: 'whoCanSendFriendRequests',
    label: 'من يمكنه إرسال طلبات صداقة',
    description: 'حدد من يمكنه إرسال طلبات صداقة',
    options: VISIBILITY_OPTIONS.filter(o => o.value !== 'only_me'),
  },
  {
    key: 'whoCanSeeProfilePicture',
    label: 'من يمكنه رؤية صورة ملفك الشخصي',
    description: '',
    options: VISIBILITY_OPTIONS,
  },
  {
    key: 'whoCanSeeCoverPhoto',
    label: 'من يمكنه رؤية صورة الغلاف',
    description: '',
    options: VISIBILITY_OPTIONS,
  },
  {
    key: 'whoCanSeeBio',
    label: 'من يمكنه رؤية النبذة عنك',
    description: '',
    options: VISIBILITY_OPTIONS,
  },
  {
    key: 'whoCanTagMe',
    label: 'من يمكنه وسمك',
    description: 'حدد من يمكنه وسمك في المنشورات',
    options: VISIBILITY_OPTIONS,
  },
];

interface BlockedUser {
  id: string;
  blocked: {
    id: string;
    name: string;
    username: string;
  };
}

export default function PrivacyPage() {
  const { data: privacyData, isLoading: privacyLoading } = usePrivacySettings();
  const { data: blocksData, isLoading: blocksLoading } = useBlocks();
  const updatePrivacy = useUpdatePrivacySettings();
  const unblockUser = useUnblockUser();
  
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockedUser | null>(null);

  const handleVisibilityChange = async (key: string, value: string) => {
    try {
      await updatePrivacy.mutateAsync({ [key]: value });
    } catch (err) {
      console.error('Failed to update privacy setting:', err);
    }
  };

  const handleSearchEnginesToggle = async () => {
    const newValue = !privacyData?.data?.allowSearchEngines;
    try {
      await updatePrivacy.mutateAsync({ allowSearchEngines: newValue });
    } catch (err) {
      console.error('Failed to update search engines setting:', err);
    }
  };

  const handleUnblock = async () => {
    if (!selectedBlock) return;
    try {
      await unblockUser.mutateAsync(selectedBlock.id);
      setShowBlockModal(false);
      setSelectedBlock(null);
    } catch (err) {
      console.error('Failed to unblock user:', err);
    }
  };

  const settings = privacyData?.data;

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

  const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: typeof VISIBILITY_OPTIONS }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 rounded-xl border border-emerald-200 bg-white/80 text-emerald-900 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (privacyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">الخصوصية</h1>
          <p className="text-emerald-700/70 mt-2">تحكم في من يرى معلوماتك</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>🔒</span> إعدادات الخصوصية
            </CardTitle>
            <CardDescription>تحكم في من يرى محتوى حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {PRIVACY_FIELDS.map((field) => (
                <div key={field.key} className="flex items-start justify-between py-3 border-b border-emerald-100/50 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-900">{field.label}</h3>
                    {field.description && (
                      <p className="text-emerald-700/70 text-sm mt-0.5">{field.description}</p>
                    )}
                  </div>
                  <SelectInput
                    value={settings?.[field.key as keyof typeof settings] || 'friends'}
                    onChange={(value) => handleVisibilityChange(field.key, value)}
                    options={field.options}
                  />
                </div>
              ))}

              <div className="flex items-start justify-between py-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">محركات البحث</h3>
                  <p className="text-emerald-700/70 text-sm mt-0.5">السماح لمحركات البحث بالربط إلى ملفك</p>
                </div>
                <ToggleSwitch
                  enabled={settings?.allowSearchEngines || false}
                  onClick={handleSearchEnginesToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>🚫</span> المستخدمين المحظورين
            </CardTitle>
            <CardDescription>الأشخاص الذين حظرتهم</CardDescription>
          </CardHeader>
          <CardContent>
            {blocksLoading ? (
              <Spinner />
            ) : blocksData?.data?.length === 0 ? (
              <p className="text-center text-emerald-700/70 py-4">لا يوجد مستخدمون محظورون</p>
            ) : (
              <div className="space-y-3">
                {blocksData?.data?.map((block: any) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-semibold">
                        {block.blocked?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-900">{block.blocked?.name || 'مستخدم محظور'}</p>
                        <p className="text-emerald-700/70 text-sm">@{block.blocked?.username || 'unknown'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBlock(block);
                        setShowBlockModal(true);
                      }}
                      className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    >
                      إلغاء الحظر
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Modal open={showBlockModal} onClose={() => setShowBlockModal(false)} title="إلغاء حظر مستخدم">
          <div className="space-y-4">
            <p className="text-sm text-emerald-700">
              هل أنت متأكد من إلغاء حظر {selectedBlock?.blocked?.name || 'هذا المستخدم'}؟
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowBlockModal(false)} className="flex-1 text-emerald-700">
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleUnblock} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                تأكيد
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}