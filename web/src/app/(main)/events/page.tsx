'use client';
import { EventsList } from '@/features/events/components/EventsList';
import { useCreateEvent } from '@/features/events/hooks';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

const INPUT_CLASS = "w-full rounded-xl border border-[var(--border)]/50 px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/50 focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 bg-[var(--card)]";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--primary)] mb-1";

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const createEvent = useCreateEvent();
  const { showToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      showToast('يرجى إدخال العنوان والتاريخ', 'error');
      return;
    }
    try {
      await createEvent.mutateAsync({ title: title.trim(), description: description.trim(), location: location.trim(), startDate, endDate: endDate || undefined, privacy: 'public' });
      showToast('تم إنشاء الحدث بنجاح', 'success');
      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate('');
      setEndDate('');
      setShowCreate(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'فشل إنشاء الحدث';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">الأحداث</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all">
          {showCreate ? 'إلغاء' : '+ إنشاء حدث'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl p-5 border space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div>
            <label htmlFor="event-title" className={LABEL_CLASS}>عنوان الحدث <span className="text-red-400">*</span></label>
            <input id="event-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="أدخل عنوان الحدث" className={INPUT_CLASS} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start" className={LABEL_CLASS}>تاريخ البداية <span className="text-red-400">*</span></label>
              <input id="event-start" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={INPUT_CLASS} required />
            </div>
            <div>
              <label htmlFor="event-end" className={LABEL_CLASS}>تاريخ النهاية</label>
              <input id="event-end" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={INPUT_CLASS} min={startDate} />
            </div>
          </div>
          <div>
            <label htmlFor="event-location" className={LABEL_CLASS}>الموقع</label>
            <input id="event-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="أدخل موقع الحدث" className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="event-description" className={LABEL_CLASS}>الوصف</label>
            <textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="أدخل وصف الحدث" rows={2} className={`${INPUT_CLASS} resize-none`} />
          </div>
          <button type="submit" disabled={createEvent.isPending} className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all">
            {createEvent.isPending ? 'جاري...' : 'إنشاء'}
          </button>
        </form>
      )}

      <EventsList />
    </div>
  );
}