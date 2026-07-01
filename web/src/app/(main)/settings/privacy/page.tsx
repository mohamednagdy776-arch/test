'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePrivacySettings, useUpdatePrivacySettings, useBlocks, useUnblockUser } from '@/features/settings/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { profileApi } from '@/features/profile/api';

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
  {
    key: 'whoCanSendMessages',
    label: 'من يمكنه مراسلتك',
    description: 'حدد من يمكنه بدء محادثة معك',
    options: VISIBILITY_OPTIONS.filter(o => o.value !== 'friends_of_friends'),
  },
  {
    key: 'whoCanFollow',
    label: 'من يمكنه متابعتك',
    description: 'حدد من يمكنه متابعة حسابك',
    options: VISIBILITY_OPTIONS.filter(o => o.value !== 'friends_of_friends'),
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

function DataExportButton() {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { apiClient } = await import('@/lib/api-client');
      const res = await apiClient.get('/users/me/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tayyibt-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch {
      showToast('تعذّر تصدير البيانات. يرجى المحاولة مجدداً.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]/50">
      <div>
        <h3 className="font-semibold text-[var(--foreground)]">تحميل نسخة من بياناتك</h3>
        <p className="text-[var(--primary)]/70 text-sm mt-0.5">ملف JSON يحتوي على ملفك الشخصي، منشوراتك، وإعداداتك</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        loading={exporting}
        className={done ? 'text-[var(--primary)] border-[var(--ring)]' : 'text-[var(--primary)] border-[var(--border)] hover:bg-[var(--muted)]'}
      >
        {done ? '✓ تم التحميل' : '⬇ تصدير'}
      </Button>
    </div>
  );
}

export default function PrivacyPage() {
  const { showToast } = useToast();
  const { data: privacyData, isLoading: privacyLoading } = usePrivacySettings();
  const { data: blocksData, isLoading: blocksLoading } = useBlocks();
  const updatePrivacy = useUpdatePrivacySettings();
  const unblockUser = useUnblockUser();

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockedUser | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const handleVisibilityChange = async (key: string, value: string) => {
    setPrivacyError(null);
    try {
      await updatePrivacy.mutateAsync({ [key]: value });
      showToast('تم حفظ الإعداد', 'success');
    } catch (err: any) {
      setPrivacyError(err?.response?.data?.message || 'فشل حفظ إعداد الخصوصية');
    }
  };

  const handleSearchEnginesToggle = async () => {
    const newValue = !privacyData?.data?.allowSearchEngines;
    setPrivacyError(null);
    try {
      await updatePrivacy.mutateAsync({ allowSearchEngines: newValue });
      showToast('تم حفظ الإعداد', 'success');
    } catch (err: any) {
      setPrivacyError(err?.response?.data?.message || 'فشل حفظ الإعداد');
    }
  };

  const handleUnblock = async () => {
    if (!selectedBlock) return;
    setPrivacyError(null);
    try {
      await unblockUser.mutateAsync(selectedBlock.id);
      setShowBlockModal(false);
      setSelectedBlock(null);
    } catch (err: any) {
      setPrivacyError(err?.response?.data?.message || 'فشل إلغاء الحظر');
    }
  };

  const settings = privacyData?.data;

  const ToggleSwitch = ({ enabled, onClick, disabled, label }: { enabled: boolean; onClick: () => void; disabled?: boolean; label?: string }) => (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled ? 'bg-[var(--primary)] shadow-inner' : 'bg-[var(--muted-foreground)]/30'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-1 w-5 h-5 rounded-full bg-[var(--card)] shadow-md transition-transform duration-300 ${
          enabled ? 'right-8' : 'right-1'
        }`}
      />
    </button>
  );

  const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: typeof VISIBILITY_OPTIONS }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}