'use client';
import { EventsList } from '@/features/events/components/EventsList';
import { useCreateEvent } from '@/features/events/hooks';
import { useState } from 'react';

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const createEvent = useCreateEvent();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;
    await createEvent.mutateAsync({ title: title.trim(), description: description.trim(), location: location.trim(), startDate });
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate('');
    setShowCreate(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">الأحداث</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          {showCreate ? 'إلغاء' : '+ إنشاء حدث'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الحدث" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3" required />
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3" required />
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="الموقع" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="الوصف" rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3" />
          <button type="submit" disabled={createEvent.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {createEvent.isPending ? 'جاري...' : 'إنشاء'}
          </button>
        </form>
      )}

      <EventsList />
    </div>
  );
}