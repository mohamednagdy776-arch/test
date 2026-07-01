'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Props {
  initial: any;
  onSaved: () => void;
  onCancel?: () => void;
}

const empty = {
  fullName: '', age: 25, gender: '', country: '', city: '',
  socialStatus: '', childrenCount: 0, bio: '',
  website: '', relationshipStatus: '', location: '', workplace: '', introVisibility: 'public',
  education: '', jobTitle: '', financialLevel: '', culturalLevel: '', lifestyle: '',
  sect: '', prayerLevel: '', religiousCommitment: '',
  minAge: 20, maxAge: 40, preferredCountry: '', relocateWilling: false, wantsChildren: true,
  workEntries: [], educationEntries: [],
};

const tabs = ['الأساسية', 'التعليم والعمل', 'الدين', 'التفضيلات'];

// Module-scope stable component — defining it inside render would remount
// inputs every keystroke and drop focus (H-08).
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</label>
    {children}
  </div>
);

export const ProfileEditForm = ({ initial, onSaved, onCancel }: Props) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ ...empty, ...(initial ?? {}) });
  const [formError, setFormError] = useState('');

  // Warn before leaving with unsaved edits (browser refresh/close) (#458).
  const initialSnapshot = useRef(JSON.stringify({ ...empty, ...(initial ?? {}) }));
  const dirty = JSON.stringify(form) !== initialSnapshot.current;
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (p: typeof form) => apiClient.patch('/users/me', p).then((r) => r.data),
    onSuccess: onSaved,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Reject a whitespace-only name and trim before saving (#407).
    const fullName = (form.fullName ?? '').trim();
    if (form.fullName && !fullName) { setTab(0); setFormError('يرجى إدخال اسم صحيح'); return; }
    if (!form.gender) { setTab(0); setFormError('يرجى اختيار الجنس'); return; }
    if (!form.age || form.age < 18 || form.age > 99) { setTab(0); setFormError('يرجى إدخال عمر صحيح (18-99)'); return; }
    if (form.minAge && form.maxAge && form.minAge > form.maxAge) {
      setTab(3); setFormError('الحد الأدنى للعمر يجب أن يكون أقل من الحد الأقصى'); return;
    }
    save.mutate({ ...form, fullName });
  };

  const str = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value }));
  const num = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    // Empty input → null (not 0). Number('') === 0 would silently submit age 0 etc.
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value === '' ? null : Number(e.target.value) }));
  const bool = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f: typeof form) => ({ ...f, [k]: e.target.value === 'true' }));

  const inp = (k: keyof typeof form, label: string, type = 'text', ph = '', maxLength?: number) => (
    <Field label={label}>
      <input type={type} value={(form as any)[k] ?? ''} onChange={type === 'number' ? num(k) : str(k)} placeholder={ph} maxLength={maxLength}