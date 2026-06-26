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
      className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--muted)] transition-all cursor-pointer"
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
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">الخصوصية</h1>
          <p className="text-[var(--primary)]/70 mt-2">تحكم في من يرى معلوماتك</p>
        </div>

        {privacyError && (
          <div className="flex items-start gap-2 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-3 text-sm text-[var(--destructive)]">
            <span>⚠️</span>
            <span className="flex-1">{privacyError}</span>
            <button onClick={() => setPrivacyError(null)} className="text-[var(--destructive)]/70 hover:text-[var(--destructive)]">✕</button>
          </div>
        )}

        <PhotoVisibilityCard />

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>🔒</span> إعدادات الخصوصية
            </CardTitle>
            <CardDescription>تحكم في من يرى محتوى حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {PRIVACY_FIELDS.map((field) => (
                <div key={field.key} className="flex items-start justify-between py-3 border-b border-[var(--border)]/50 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--foreground)]">{field.label}</h3>
                    {field.description && (
                      <p className="text-[var(--primary)]/70 text-sm mt-0.5">{field.description}</p>
                    )}
                  </div>
                  <SelectInput
                    value={settings?.[field.key as keyof typeof settings] as string || 'friends'}
                    onChange={(value) => handleVisibilityChange(field.key, value)}
                    options={field.options}
                  />
                </div>
              ))}

              <div className="flex items-start justify-between py-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">محركات البحث</h3>
                  <p className="text-[var(--primary)]/70 text-sm mt-0.5">السماح لمحركات البحث بالربط إلى ملفك</p>
                </div>
                <ToggleSwitch
                  enabled={settings?.allowSearchEngines || false}
                  onClick={handleSearchEnginesToggle}
                  label="السماح لمحركات البحث"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>🚫</span> المستخدمين المحظورين
            </CardTitle>
            <CardDescription>الأشخاص الذين حظرتهم</CardDescription>
          </CardHeader>
          <CardContent>
            {blocksLoading ? (
              <Spinner />
            ) : blocksData?.data?.length === 0 ? (
              <p className="text-center text-[var(--primary)]/70 py-4">لا يوجد مستخدمون محظورون</p>
            ) : (
              <div className="space-y-3">
                {blocksData?.data?.map((block: any) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--muted)] to-[var(--border)] flex items-center justify-center text-[var(--primary)] font-semibold">
                        {block.blocked?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{block.blocked?.name || 'مستخدم محظور'}</p>
                        <p className="text-[var(--primary)]/70 text-sm">@{block.blocked?.username || 'unknown'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBlock(block);
                        setShowBlockModal(true);
                      }}
                      className="text-[var(--primary)] border-[var(--border)] hover:bg-[var(--muted)]"
                    >
                      إلغاء الحظر
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>📦</span> تصدير بياناتك
            </CardTitle>
            <CardDescription>احصل على نسخة من جميع بياناتك الشخصية (GDPR / PDPA)</CardDescription>
          </CardHeader>
          <CardContent>
            <DataExportButton />
          </CardContent>
        </Card>

        <Modal open={showBlockModal} onClose={() => setShowBlockModal(false)} title="إلغاء حظر مستخدم">
          <div className="space-y-4">
            <p className="text-sm text-[var(--primary)]">
              هل أنت متأكد من إلغاء حظر {selectedBlock?.blocked?.name || 'هذا المستخدم'}؟
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowBlockModal(false)} className="flex-1 text-[var(--primary)]">
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleUnblock} className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                تأكيد
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// [Body_Sadek] #752 — modesty-first photo privacy control.
const PHOTO_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'public', label: 'عامة', desc: 'يراها أي شخص' },
  { value: 'matches_only', label: 'للمتوافقين فقط', desc: 'تظهر بعد التوافق المتبادل أو الصداقة' },
  { value: 'on_request', label: 'عند الطلب', desc: 'تظهر فقط لمن توافق على طلبه' },
  { value: 'private', label: 'خاصة', desc: 'لا تظهر لأحد' },
];

function PhotoVisibilityCard() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { data } = useQuery({ queryKey: ['my-profile'], queryFn: profileApi.getMyProfile });
  const current: string = data?.data?.photoVisibility ?? 'public';

  const incognito: boolean = data?.data?.incognito ?? false;

  const update = useMutation({
    mutationFn: (patch: Record<string, any>) => profileApi.updateProfile(patch),
    onSuccess: () => { showToast('تم تحديث الإعداد', 'success'); qc.invalidateQueries({ queryKey: ['my-profile'] }); },
    onError: () => showToast('تعذّر تحديث الإعداد', 'error'),
  });

  return (
    <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
      <CardHeader>
        <CardTitle className="text-[var(--foreground)] flex items-center gap-2"><span>🖼️</span> خصوصية الصور</CardTitle>
        <CardDescription>تحكّم في من يستطيع رؤية صورك</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {PHOTO_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex items-start gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors"
              style={{
                borderColor: current === o.value ? 'var(--ring)' : 'var(--border)',
                background: current === o.value ? 'color-mix(in srgb, var(--accent) 10%, var(--card))' : 'var(--card)',
              }}
            >
              <input
                type="radio"
                name="photo-visibility"
                checked={current === o.value}
                onChange={() => update.mutate({ photoVisibility: o.value })}
                disabled={update.isPending}
                className="mt-1 accent-[var(--accent)]"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{o.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{o.desc}</p>
              </div>
            </label>
          ))}

          {/* Incognito browsing (#757) */}
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3 cursor-pointer mt-2">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">التصفّح المخفي</p>
              <p className="text-xs text-[var(--muted-foreground)]">تصفّح الملفات دون ترك أثر "شاهد ملفك"</p>
            </div>
            <input
              type="checkbox"
              role="switch"
              aria-checked={incognito}
              checked={incognito}
              onChange={(e) => update.mutate({ incognito: e.target.checked })}
              disabled={update.isPending}
              className="h-5 w-5 accent-[var(--primary)]"
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
