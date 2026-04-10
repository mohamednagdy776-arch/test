'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/Spinner';
import { useRsvpEvent } from '../hooks';
import { useToast } from '@/components/ui/Toast';

export const EventsList = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get('/events').then(res => res.data),
  });

  const rsvpEvent = useRsvpEvent();
  const { showToast } = useToast();

  const handleRsvp = async (eventId: string, status: 'going' | 'interested' | 'not_going') => {
    try {
      await rsvpEvent.mutateAsync({ eventId, status });
      showToast('تم تحديث حالة الحضور بنجاح', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل تحديث حالة الحضور', 'error');
      console.error('RSVP failed:', err);
    }
  };

  if (isLoading) return <Spinner />;

  const events = data?.data || [];

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-center text-[#547792] py-8">لا توجد أحداث</p>
      ) : (
        events.map((event: any) => (
          <div key={event.id} className="p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF] hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-[#213448] mb-1">{event.title}</h3>
            <p className="text-xs text-[#547792] mb-2">
              {event.startDate ? new Date(event.startDate).toLocaleDateString('ar-SA') : ''}
              {event.location && ` • ${event.location}`}
            </p>
            {event.description && (
              <p className="text-sm text-[#547792] line-clamp-2">{event.description}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => handleRsvp(event.id, 'going')}
                disabled={rsvpEvent.isPending}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ${event.userRsvp === 'going' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {rsvpEvent.isPending ? '...' : `ذاهب (${event.goingCount || 0})`}
              </button>
              <button 
                onClick={() => handleRsvp(event.id, 'interested')}
                disabled={rsvpEvent.isPending}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ${event.userRsvp === 'interested' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
              >
                {rsvpEvent.isPending ? '...' : `مهتم (${event.interestedCount || 0})`}
              </button>
              <button 
                onClick={() => handleRsvp(event.id, 'not_going')}
                disabled={rsvpEvent.isPending}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 ${event.userRsvp === 'not_going' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
              >
                {rsvpEvent.isPending ? '...' : 'لا ذاهب'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};