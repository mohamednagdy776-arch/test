'use client';
import { usePage, useLikePage, useUnlikePage, useFollowPage, useUnfollowPage, usePagePosts } from '@/features/pages/hooks';
import { Spinner } from '@/components/ui/Spinner';
import { useParams } from 'next/navigation';

export default function PageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: pageData, isLoading: isLoadingPage } = usePage(id);
  const { data: postsData, isLoading: isLoadingPosts } = usePagePosts(id);
  
  const likePage = useLikePage();
  const unlikePage = useUnlikePage();
  const followPage = useFollowPage();
  const unfollowPage = useUnfollowPage();
  
  const page = pageData?.data;
  const posts = (postsData?.data as any[]) || [];
  
  const isLiked = pageData?.data?.isLiked as boolean || false;
  const isFollowing = pageData?.data?.isFollowing as boolean || false;
  
  const handleLike = () => {
    if (isLiked) {
      unlikePage.mutate(id);
    } else {
      likePage.mutate(id);
    }
  };
  
  const handleFollow = () => {
    if (isFollowing) {
      unfollowPage.mutate(id);
    } else {
      followPage.mutate(id);
    }
  };
  
  if (isLoadingPage) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  
  if (!page) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center text-slate-500">
        الصفحة غير موجودة
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-5">
        {page.coverPhoto ? (
          <img src={page.coverPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-amber-500/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-900/20 to-transparent" />
        <div className="absolute bottom-5 right-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{page.name}</h1>
          {page.category && (
            <span className="text-sm text-white/80 font-medium">{page.category}</span>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100 mb-5">
        <div className="flex flex-wrap items-center gap-5 mb-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-semibold">{page.likeCount || 0}</span>
            <span className="text-sm">إعجاب</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">{page.followerCount || 0}</span>
            <span className="text-sm">متابع</span>
          </div>
        </div>
        
        {page.description && (
          <p className="text-emerald-800/80 mb-4">{page.description}</p>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            disabled={likePage.isPending || unlikePage.isPending}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              isLiked
                ? 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-600 shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30'
                : 'bg-white/80 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-50 shadow-md'
            } disabled:opacity-50`}
          >
            {likePage.isPending || unlikePage.isPending ? '...' : isLiked ? 'إعجاب ❤️' : 'إعجاب'}
          </button>
          <button
            onClick={handleFollow}
            disabled={followPage.isPending || unfollowPage.isPending}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              isFollowing
                ? 'bg-white/80 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-50 shadow-md'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'
            } disabled:opacity-50`}
          >
            {followPage.isPending || unfollowPage.isPending ? '...' : isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-emerald-900 mb-4">المنشورات</h2>
        {isLoadingPosts ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-8 text-center text-emerald-600/60 border border-emerald-100">
            <p className="text-3xl mb-2">📝</p>
            <p>لا توجد منشورات بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400/20 to-amber-500/10 flex items-center justify-center">
                    {page.coverPhoto ? (
                      <img src={page.coverPhoto} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-lg font-bold text-emerald-600">{page.name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{page.name}</p>
                    <p className="text-xs text-emerald-600/60">
                      {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                {post.content && (
                  <p className="text-emerald-800/80 whitespace-pre-wrap">{post.content}</p>
                )}
                {post.mediaUrl && (
                  <div className="mt-3">
                    <img src={post.mediaUrl} alt="" className="max-h-96 rounded-xl" />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-emerald-100 text-sm text-emerald-600/60">
                  <span>❤️ {post.likeCount || 0}</span>
                  <span>💬 {post.commentCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}