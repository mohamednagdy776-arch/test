'use client';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useJoinGroup, useLeaveGroup } from '@/features/groups/hooks';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGroup(id);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-40 rounded-xl bg-white animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-gray-500">حدث خطأ في تحميل المجتمع</p>
        <button
          onClick={() => router.push('/groups')}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          العودة للمجتمعات
        </button>
      </div>
    );
  }

  const group = data.data || data;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/groups')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        عودة للمجتمعات
      </button>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                group.privacy === 'public' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {group.privacy === 'public' ? 'عام' : 'خاص'}
              </span>
            </div>
            <p className="text-gray-600">{group.description || 'لا يوجد وصف'}</p>
            <p className="mt-2 text-sm text-gray-400">
              {group.memberCount ?? 0} عضو
            </p>
          </div>

          <div className="shrink-0">
            {group.isMember ? (
              <button
                onClick={() => leaveGroup.mutate(id)}
                disabled={leaveGroup.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {leaveGroup.isPending ? 'جاري المغادرة...' : 'مغادرة المجتمع'}
              </button>
            ) : (
              <button
                onClick={() => joinGroup.mutate(id)}
                disabled={joinGroup.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {joinGroup.isPending ? 'جاري الانضمام...' : 'انضم للمجتمع'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
