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
    description: 'حدد من يمكنه وسمك في منشورات وصور',
    options: VISIBILITY_OPTIONS,
  },
];

export default function PrivacyPage() {
  const { data: privacyData, isLoading: privacyLoading } = usePrivacySettings();
  const { data: blocksData, isLoading: blocksLoading } = useBlocks();
  const updatePrivacy = useUpdatePrivacySettings();
  const unblockUser = useUnblockUser();
  
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<{ id: string; blocked: { id: string; name: string; username: string } } | null>(null);

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

  if (privacyLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
          ← الإعدادات
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#213448]">الخصوصية</h1>
        <p className="text-sm text-[#547792] mt-1">تحكم في من يمكنه رؤية معلوماتك والتفاعل معك</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🔒</span> إعدادات الخصوصية
          </CardTitle>
          <CardDescription>تحكم في من يمكنه رؤية محتوى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {PRIVACY_FIELDS.map((field) => (
              <div key={field.key} className="flex items-start justify-between py-3 border-b border-[#C8D8DF]/30 last:border-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#213448]">{field.label}</h3>
                  {field.description && (
                    <p className="text-sm text-[#547792] mt-0.5">{field.description}</p>
                  )}
                </div>
                <select
                  value={settings?.[field.key as keyof typeof settings] || 'friends'}
                  onChange={(e) => handleVisibilityChange(field.key, e.target.value)}
                  className="ml-4 px-3 py-2 rounded-lg border border-[#C8D8DF] bg-white text-[#213448] text-sm focus:outline-none focus:border-[#547792]"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex items-start justify-between py-3">
              <div className="flex-1">
                <h3 className="font-semibold text-[#213448]">محركات البحث</h3>
                <p className="text-sm text-[#547792] mt-0.5">السماح بمحركات البحث بالربط إلى ملفك الشخصي</p>
              </div>
              <button
                onClick={handleSearchEnginesToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings?.allowSearchEngines ? 'bg-[#4A8C6F]' : 'bg-[#C8D8DF]'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings?.allowSearchEngines ? 'right-7' : 'right-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🚫</span> المستخدمين المحظورين
          </CardTitle>
          <CardDescription>الأشخاص الذين حظرتهم لن يستطيعوا رؤية منشوراتك أو التواصل معك</CardDescription>
        </CardHeader>
        <CardContent>
          {blocksLoading ? (
            <Spinner />
          ) : blocksData?.data?.length === 0 ? (
            <p className="text-center text-[#547792] py-4">لا يوجد مستخدمون محظورون</p>
          ) : (
            <div className="space-y-3">
              {blocksData?.data?.map((block: any) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4E8EE] flex items-center justify-center text-[#547792] font-semibold">
                      {block.blocked?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#213448]">{block.blocked?.name || 'مستخدم محظور'}</p>
                      <p className="text-sm text-[#547792]">@{block.blocked?.username || 'unknown'}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBlock(block);
                      setShowBlockModal(true);
                    }}
                    className="text-[#547792] border-[#547792]/30"
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
          <p className="text-sm text-[#547792]">
            هل أنت متأكد من إلغاء حظر {selectedBlock?.blocked?.name || 'هذا المستخدم'}؟
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowBlockModal(false)} className="flex-1">
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleUnblock} className="flex-1">
              تأكيد
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
