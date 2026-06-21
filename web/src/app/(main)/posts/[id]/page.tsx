'use client';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = usePost(id);
  const post = (data as any)?.data ?? data;

  const handleBack = () => {
    const referrer = document.referrer;
    const isSameOrigin = referrer && new URL(referrer).origin === window.location.origin;
    if (isSameOrigin) {
      router.back();
    } else {
      router.push('/posts');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)] transition-colors"
      >
        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        رجوع
      </button>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-40 rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)]" />
          <div className="h-24 rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-[var(--primary)] text-sm leading-relaxed">
            تعذّر تحميل المنشور. ربما تم حذفه أو لا تملك صلاحية رؤيته.
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl transition-all"
          >
            العودة
          </button>
        </div>
      )}

      {!isLoading && !isError && post && <PostCard post={post} />}
    </div>
  );
}
