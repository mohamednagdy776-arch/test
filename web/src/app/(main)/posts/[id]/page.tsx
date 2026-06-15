'use client';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = usePost(id);
  const post = (data as any)?.data ?? data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-amber-50/30">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-[#547792] hover:underline"
      >
        ← رجوع
      </button>

      {isLoading && (
        <div className="h-40 rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 animate-pulse" />
      )}

      {isError && (
        <div className="rounded-2xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-8 text-center text-sm text-[#547792]">
          تعذّر تحميل المنشور. ربما تم حذفه أو لا تملك صلاحية رؤيته.
        </div>
      )}

      {!isLoading && !isError && post && <PostCard post={post} />}
    </div>
  );
}
