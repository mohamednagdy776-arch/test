'use client';
import { EventsList } from '@/features/events/components/EventsList';
import { useCreateEvent } from '@/features/events/hooks';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { CalendarBlank, Plus, X, MapPin, Clock } from '@phosphor-icons/react';

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [location,    setLocation]    = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  // No button/input existed anywhere to upload a custom event cover photo
  // (#374) -- the createEventWithCover API call already existed but was
  // dead code since the backend had no file interceptor to receive it.
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const createEvent   = useCreateEvent();
  const { showToast } = useToast() as any;

  const resetForm = () => {
    setTitle(''); setDescription(''); setLocation('');
    setStartDate(''); setEndDate('');
    setCoverPhoto(null); setCoverPreview(null);
    setShowCreate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      showToast('يرجى إدخال العنوان والتاريخ', 'error');
      return;
    }
    // Relied entirely on the native `min` attribute for this, which shows an
    // unlocalized browser validation bubble anchored to the field instead of
    // the app's own toast pattern (#235).
    if (endDate && endDate < startDate) {
      showToast('تاريخ النهاية يجب أن يكون بعد تاريخ البداية', 'error');
      return;
    }
    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate,
        endDate: endDate || undefined,
        privacy: 'public',
        ...(coverPhoto ? { coverPhoto } : {}),
      });
      showToast('تم إنشاء الحدث بنجاح', 'success');
      resetForm();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'فشل إنشاء الحدث', 'error');
    }
  };

  const inputStyle = { background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' };
  const inputClass = "w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
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
              <CalendarBlank size={14} weight="fill" className="text-white/70" />
              <span className="text-[11px] font-semibold text-white/70">الأحداث</span>
            </div>
            <h1 className="text-xl font-extrabold text-white">الأحداث والفعاليات</h1>
            <p className="text-xs text-white/70 mt-0.5">اكتشف وشارك في الأحداث القادمة</p>
          </div>
          <button onClick={() => setShowCreate((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            {showCreate ? <X size={15} /> : <Plus size={15} />}
            {showCreate ? 'إلغاء' : 'إنشاء حدث'}
          </button>
        </div>
      </div>

      {/* ── Create Event Form ───────────────────────────────── */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div>
            <label htmlFor="event-title" className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}>
              عنوان الحدث <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input id="event-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الحدث" required
              className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
              صورة الغلاف
            </label>
            {coverPreview ? (
              <div className="relative h-32 rounded-xl overflow-hidden">
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setCoverPhoto(null); setCoverPreview(null); }}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-20 rounded-xl cursor-pointer text-sm"
                style={{ ...inputStyle, borderStyle: 'dashed' }}>
                <Plus size={14} />
                إضافة صورة غلاف
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setCoverPhoto(f); setCoverPreview(URL.createObjectURL(f)); }
                  }} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start" className="block text-xs font-semibold mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}>
                <span className="flex items-center gap-1">
                  <CalendarBlank size={11} /> تاريخ البداية <span style={{ color: 'var(--destructive)' }}>*</span>
                </span>
              </label>
              <input id="event-start" type="datetime-local" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} required
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="event-end" className="block text-xs font-semibold mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}>
                <span className="flex items-center gap-1"><Clock size={11} /> تاريخ النهاية</span>
              </label>
              <input id="event-end" type="datetime-local" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} min={startDate}
                className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="event-location" className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1"><MapPin size={11} /> الموقع</span>
            </label>
            <input id="event-location" type="text" value={location}
              onChange={(e) => setLocation(e.target.value)} placeholder="أدخل موقع الحدث"
              className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label htmlFor="event-description" className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}>الوصف</label>
            <textarea id="event-description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الحدث..." rows={2}
              className={`${inputClass} resize-none`} style={inputStyle} />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={resetForm}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              إلغاء
            </button>
            <button type="submit" disabled={createEvent.isPending}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
              {createEvent.isPending ? 'جاري...' : (<><Plus size={14} /> إنشاء</>)}
            </button>
          </div>
        </form>
      )}

      {/* ── Events list ─────────────────────────────────────── */}
      <EventsList />
    </div>
  );
}
