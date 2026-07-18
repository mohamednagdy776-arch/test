'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMyProfile, useUpdateProfile } from '@/features/profile/hooks';
import { INTEREST_GROUPS, SKILL_GROUPS, TagGroup } from '@/features/profile/extended-taxonomy';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/I18nProvider';
import { Plus, X } from '@phosphor-icons/react';

const MAX_TAG_LENGTH = 60;
const MAX_TAGS = 50;

interface EnumField {
  key: 'healthStatus' | 'employmentType' | 'quranMemorization' | 'mosqueAttendance' | 'insuranceType';
  label: string;
  options: { value: string; label: string }[];
}

const ENUM_FIELDS: EnumField[] = [
  {
    key: 'healthStatus',
    label: 'الوضع الصحي',
    options: [
      { value: 'healthy', label: 'سليم' },
      { value: 'has_condition', label: 'يعاني من حالة صحية' },
    ],
  },
  {
    key: 'employmentType',
    label: 'الوضع المهني',
    options: [
      { value: 'employee', label: 'موظف' },
      { value: 'business_owner', label: 'صاحب عمل' },
      { value: 'retired', label: 'متقاعد' },
      { value: 'other', label: 'أخرى' },
    ],
  },
  {
    key: 'quranMemorization',
    label: 'حفظ القرآن',
    options: [
      { value: 'none', label: 'لا يوجد حفظ' },
      { value: 'juz_amma', label: 'جزء عمّ' },
      { value: 'several_juz', label: 'عدة أجزاء' },
      { value: 'half_or_more', label: 'نصف القرآن أو أكثر' },
      { value: 'complete', label: 'القرآن كاملاً' },
    ],
  },
  {
    key: 'mosqueAttendance',
    label: 'الذهاب إلى المسجد',
    options: [
      { value: 'rarely', label: 'نادراً' },
      { value: 'friday_only', label: 'الجمعة فقط' },
      { value: 'weekly', label: 'أسبوعياً' },
      { value: 'daily', label: 'يومياً' },
    ],
  },
  {
    key: 'insuranceType',
    label: 'التأمين',
    options: [
      { value: 'life', label: 'تأمين على الحياة' },
      { value: 'health', label: 'تأمين صحي' },
      { value: 'none', label: 'لا أملك أي تأمين' },
    ],
  },
];

function TagChip({ tag, active, onClick, removable }: { tag: string; active: boolean; onClick: () => void; removable?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors"
      style={{
        borderColor: active ? 'var(--ring)' : 'var(--border)',
        background: active ? 'color-mix(in srgb, var(--accent) 15%, var(--card))' : 'var(--card)',
        color: active ? 'var(--accent)' : 'var(--muted-foreground)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {tag}
      {removable && <X size={12} weight="bold" />}
    </button>
  );
}

function TagPicker({ groups, selected, onToggle }: { groups: TagGroup[]; selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{group.label}</h4>
          <div className="flex flex-wrap gap-2">
            {group.options.map((tag) => (
              <TagChip key={tag} tag={tag} active={selected.includes(tag)} onClick={() => onToggle(tag)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Free-text additions (#profile-freeform): the curated taxonomy can't cover
// every hobby/skill a user might have, so let them type their own instead of
// being limited to the predefined chip lists.
function CustomTagSection({
  label, customTags, onAdd, onRemove, disabled,
}: {
  label: string; customTags: string[]; onAdd: (tag: string) => void; onRemove: (tag: string) => void; disabled: boolean;
}) {
  const [draft, setDraft] = useState('');
  const { showToast } = useToast();

  const submit = () => {
    const value = draft.trim();
    if (!value) return;
    if (value.length > MAX_TAG_LENGTH) {
      showToast(`الحد الأقصى ${MAX_TAG_LENGTH} حرفاً`, 'error');
      return;
    }
    if (disabled) {
      showToast(`لا يمكن إضافة أكثر من ${MAX_TAGS} عنصراً`, 'error');
      return;
    }
    onAdd(value);
    setDraft('');
  };

  return (
    <div>
      <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</h4>
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {customTags.map((tag) => (
            <TagChip key={tag} tag={tag} active removable onClick={() => onRemove(tag)} />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder="اكتب ما يميّزك ولم تجده في القائمة..."
          maxLength={MAX_TAG_LENGTH}
          disabled={disabled}
          className="flex-1 px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
          style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !draft.trim()}
          className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          <Plus size={16} weight="bold" /> إضافة
        </button>
      </div>
    </div>
  );
}

export default function ExtendedProfilePage() {
  const { t } = useT();
  const { showToast } = useToast();
  const { data, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const profile = data?.data;

  const [enumValues, setEnumValues] = useState<Record<string, string>>({});
  const [settleCountry, setSettleCountry] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;
    setEnumValues({
      healthStatus: profile.healthStatus ?? '',
      employmentType: profile.employmentType ?? '',
      quranMemorization: profile.quranMemorization ?? '',
      mosqueAttendance: profile.mosqueAttendance ?? '',
      insuranceType: profile.insuranceType ?? '',
    });
    setSettleCountry(profile.settleCountry ?? '');
    setInterests(profile.interests ?? []);
    setSkills(profile.skills ?? []);
  }, [profile]);

  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const addCustomTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    if (list.includes(tag)) return;
    setList([...list, tag]);
  };

  const knownInterestTags = useMemo(() => new Set(INTEREST_GROUPS.flatMap((g) => g.options)), []);
  const knownSkillTags = useMemo(() => new Set(SKILL_GROUPS.flatMap((g) => g.options)), []);
  const customInterests = interests.filter((tag) => !knownInterestTags.has(tag));
  const customSkills = skills.filter((tag) => !knownSkillTags.has(tag));

  const handleSave = async () => {
    try {
      // @IsOptional() on the backend DTO only skips null/undefined, not ''
      // (an empty-string enum value still runs @IsEnum and 400s) -- drop
      // unset selects before sending, same pattern as RegisterForm's payload.
      const enumPayload = Object.fromEntries(
        Object.entries(enumValues).filter(([, v]) => v !== '')
      );
      await updateProfile.mutateAsync({
        ...enumPayload,
        settleCountry: settleCountry.trim(),
        interests,
        skills,
      });
      showToast('تم حفظ بياناتك بنجاح', 'success');
    } catch {
      showToast('تعذّر حفظ البيانات، حاول مرة أخرى', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> <span>{t('lang.back')}</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>الملف الشخصي الموسّع</h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
            كل ما تضيفه هنا اختياري، ويساعد في حساب توافق أدق مع الأشخاص المناسبين لك.
          </p>
        </div>

        <Card variant="default" className="bg-[var(--card)] border-[var(--border)]/50">
          <CardHeader>
            <CardTitle style={{ color: 'var(--foreground)' }}>بيانات شخصية إضافية</CardTitle>
            <CardDescription>تفاصيل تساعد في فهم أسلوب حياتك ورؤيتك المستقبلية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ENUM_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-4 py-2">
                  <label className="text-sm font-medium flex-1" style={{ color: 'var(--foreground)' }}>{field.label}</label>
                  <select
                    value={enumValues[field.key] ?? ''}
                    onChange={(e) => setEnumValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    className="shrink-0 w-auto min-w-fit px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                  >
                    <option value="">— لم يُحدَّد —</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="flex items-center justify-between gap-4 py-2">
                <label className="text-sm font-medium flex-1" style={{ color: 'var(--foreground)' }}>
                  الرغبة في الاستقرار (بلد معين)
                </label>
                <input
                  type="text"
                  value={settleCountry}
                  onChange={(e) => setSettleCountry(e.target.value)}
                  placeholder="مثال: السعودية"
                  maxLength={100}
                  className="shrink-0 w-40 px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] border-[var(--border)]/50">
          <CardHeader>
            <CardTitle style={{ color: 'var(--foreground)' }}>الاهتمامات والهوايات</CardTitle>
            <CardDescription>اختر كل ما ينطبق عليك، أو أضف ما تريد بنفسك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <CustomTagSection
                label="إضافاتك الخاصة"
                customTags={customInterests}
                onAdd={(tag) => addCustomTag(interests, setInterests, tag)}
                onRemove={(tag) => toggleTag(interests, setInterests, tag)}
                disabled={interests.length >= MAX_TAGS}
              />
              <TagPicker groups={INTEREST_GROUPS} selected={interests} onToggle={(tag) => toggleTag(interests, setInterests, tag)} />
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] border-[var(--border)]/50">
          <CardHeader>
            <CardTitle style={{ color: 'var(--foreground)' }}>المهارات</CardTitle>
            <CardDescription>اختر كل ما ينطبق عليك، أو أضف ما تريد بنفسك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <CustomTagSection
                label="إضافاتك الخاصة"
                customTags={customSkills}
                onAdd={(tag) => addCustomTag(skills, setSkills, tag)}
                onRemove={(tag) => toggleTag(skills, setSkills, tag)}
                disabled={skills.length >= MAX_TAGS}
              />
              <TagPicker groups={SKILL_GROUPS} selected={skills} onToggle={(tag) => toggleTag(skills, setSkills, tag)} />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            loading={updateProfile.isPending}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-lg"
          >
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </div>
  );
}
