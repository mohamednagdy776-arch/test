'use client';
import { EventsList } from '@/features/events/components/EventsList';
import { useCreateEvent } from '@/features/events/hooks';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const createEvent = useCreateEvent();
  const { showToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      showToast('يرجى إدخال العنوان والتاريخ', 'error');
      return;
    }
    console.log('[EventsPage] Creating event:', { title, description, location, startDate });
    try {
      const result = await createEvent.mutateAsync({ title: title.trim(), description: description.trim(), location: location.trim(), startDate, privacy: 'public' });
      console.log('[EventsPage] Create success:', result);
      showToast('تم إنشاء الحدث بنجاح', 'success');
      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate('');
      setShowCreate(false);
    } catch (err: any) {
      console.error('[EventsPage] Create error:', err);
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
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الحدث" className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm mb-3 text-emerald-900 placeholder-emerald-400/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80" required />
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm mb-3 text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80" required />
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="الموقع" className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm mb-3 text-emerald-900 placeholder-emerald-400/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="الوصف" rows={2} className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm mb-3 text-emerald-900 placeholder-emerald-400/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80 resize-none" />
          <button type="submit" disabled={createEvent.isPending} className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
            {createEvent.isPending ? 'جاري...' : 'إنشاء'}
          </button>
        </form>
      )}

      <EventsList />
    </div>
  );
}