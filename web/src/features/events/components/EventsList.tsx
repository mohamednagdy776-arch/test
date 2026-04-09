'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/Spinner';

export const EventsList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get('/events').then(res => res.data),
  });

  if (isLoading) return <Spinner />;

  const events = data?.data || [];

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-center text-gray-500 py-8">لا توجد أحداث</p>
      ) : (
        events.map((event: any) => (
          <div key={event.id} className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
            <p className="text-xs text-gray-500 mb-2">
              {event.startDate ? new Date(event.startDate).toLocaleDateString('ar-SA') : ''}
              {event.location && ` • ${event.location}`}
            </p>
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                ذاهب ({event.goingCount || 0})
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                مهتم ({event.interestedCount || 0})
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};