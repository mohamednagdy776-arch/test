'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/Spinner';
import { StoryViewer } from '@/features/posts/components/StoryViewer';

// Story-reaction notifications and saved-story items link directly to a
// single story by id, but no page existed to open it standalone -- clicking
// them either 404'd or (notifications) fell back to the reactor's profile
// instead of showing the story (#363).
export default function SingleStoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['story', id],
    queryFn: () => apiClient.get(`/stories/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const story = data?.data;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !story) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white px-8">
          <p className="text-lg font-semibold mb-4">لم يتم العثور على القصة</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-full font-semibold text-sm bg-white text-black"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <StoryViewer
      stories={[{ user: story.user, stories: [story] }]}
      initialUserIndex={0}
      onClose={() => router.push('/dashboard')}
    />
  );
}
