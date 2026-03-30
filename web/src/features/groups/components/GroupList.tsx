'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Group } from '@/types';

const GroupCard = ({ group }: { group: Group }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="font-semibold text-gray-900">{group.name}</h3>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${group.privacy === 'public' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {group.privacy === 'public' ? 'عام' : 'خاص'}
      </span>
    </div>
    <p className="text-sm text-gray-500 line-clamp-2">{group.description || 'لا يوجد وصف'}</p>
    <button className="mt-3 w-full rounded-lg border border-primary py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors">
      انضم
    </button>
  </div>
);

export const GroupList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['groups-web'],
    queryFn: () => apiClient.get('/groups', { params: { page: 1, limit: 20 } }).then((r) => r.data),
  });

  if (isLoading) return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[1,2,3,4].map((i) => <div key={i} className="h-36 rounded-xl bg-white animate-pulse" />)}</div>;
  if (isError) return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل المجتمعات</div>;

  const groups: Group[] = data?.data ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {groups.length === 0
        ? <div className="col-span-2 rounded-xl bg-white p-8 text-center text-gray-400">لا توجد مجتمعات بعد</div>
        : groups.map((g) => <GroupCard key={g.id} group={g} />)
      }
    </div>
  );
};
