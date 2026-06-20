'use client';
import { EventsList } from '@/features/events/components/EventsList';
import { useCreateEvent } from '@/features/events/hooks';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

const INPUT_CLASS = "w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm text-emerald-900 placeholder-emerald-400/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80";
const LABEL_CLASS = "block text-xs font-semibold text-emerald-700 mb-1";

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
        <h1 className="text-2xl font-bold text-emerald-900">الأحداث</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
          {showCreate ? 'إلغاء' : '+ إنشاء حدث'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100 space-y-3">
          <div>
            <label htmlFor="event-title" className={LABEL_CLASS}>عنوان الحدث <span className="text-red-400">*</span></label>
            <input id="event-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="أدخل عنوان الحدث" className={INPUT_CLASS} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          <button type="submit" disabled={createEvent.isPending} className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
            {createEvent.isPending ? 'جاري...' : 'إنشاء'}
          </button>
        </form>
      )}

      <EventsList />
    </div>
  );
}