'use client';
import Image from 'next/image';
import { GroupList } from '@/features/groups/components/GroupList';
import { useCreateGroup } from '@/features/groups/hooks';
import { useToast } from '@/components/ui/Toast';
import { useState, useRef } from 'react';
import { Users, Plus, X, Image as ImageIcon } from '@phosphor-icons/react';

const CATEGORIES = [
  'دراسة', 'صحة', 'رياضة', 'تكنولوجيا', 'فنون',
  'موسيقى', 'ألعاب', 'طعام', 'سفر', 'أعمال', 'أخرى',
];

export default function GroupsPage() {
  const [showCreate, setShowCreate]     = useState(false);
  const [name, setName]                 = useState('');
  const [description, setDescription]  = useState('');
  const [privacy, setPrivacy]           = useState<'public' | 'private' | 'secret'>('public');
  const [category, setCategory]         = useState('');
  const [coverPhoto, setCoverPhoto]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createGroup  = useCreateGroup();
  const { showToast } = useToast() as any;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName(''); setDescription(''); setPrivacy('public');
    setCategory(''); setCoverPhoto(null); setCoverPreview(null);
    setShowCreate(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        privacy,
        category: category.trim(),
        coverPhoto: coverPhoto || undefined,
      });
      showToast('تم إنشاء المجتمع بنجاح', 'success');
      resetForm();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل إنشاء المجتمع', 'error');
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";
  const inputStyle = { background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' };

  return (
    <div className="space-y-5">
      {/* ── Luxury Hero Header ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)',
          boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 30%, transparent)',
        }}>
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white opacity-10" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white opacity-10" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Users size={14} weight="fill" className="text-white/70" />
              <span className="text-[11px] font-semibold text-white/70">المجتمعات</span>
            </div>
            <h1 className="text-xl font-extrabold text-white">اكتشف وانضم</h1>
            <p className="text-xs text-white/70 mt-0.5">جد مجتمعاتك وشارك مع أشخاص مثلك</p>
          </div>
          <button onClick={() => setShowCreate((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            {showCreate ? <X size={15} /> : <Plus size={15} />}
            {showCreate ? 'إلغاء' : 'إنشاء مجتمع'}
          </button>
        </div>
      </div>

      {/* ── Create Group Form ───────────────────────────────── */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Cover photo picker */}
          <div className="relative h-40">
            {coverPreview ? (
              <>
                <Image src={coverPreview} alt="" fill className="object-cover" />
                <button type="button" aria-label="إزالة صورة الغلاف"
                  onClick={() => { setCoverPhoto(null); setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}>
                  <X size={14} />
                </button>
              </>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <ImageIcon size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">إضافة صورة غلاف</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="p-5 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  اسم المجتمع <span style={{ color: 'var(--destructive)' }}>*</span>
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="اسم المجتمع" required
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>الفئة</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className={`${inputClass} cursor-pointer appearance-none`} style={inputStyle}>
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>الخصوصية</label>
              <select value={privacy} onChange={(e) => setPrivacy(e.target.value as any)}
                className={`${inputClass} cursor-pointer appearance-none`} style={inputStyle}>
                <option value="public">عام — يمكن للجميع الرؤية والانضمام</option>
                <option value="private">خاص — يتطلب موافقة المسؤول</option>
                <option value="secret">سري — للأعضاء فقط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>الوصف (اختياري)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المجتمع..." rows={2} style={inputStyle}
                className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={resetForm}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                إلغاء
              </button>
              <button type="submit" disabled={createGroup.isPending || !name.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                {createGroup.isPending ? 'جاري الإنشاء...' : (<><Plus size={14} /> إنشاء</>)}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Group List ─────────────────────────────────────── */}
      <GroupList />
    </div>
  );
}
