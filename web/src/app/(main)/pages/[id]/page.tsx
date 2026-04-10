'use client';
import { usePage, useLikePage, useUnlikePage, useFollowPage, useUnfollowPage, usePagePosts } from '@/features/pages/hooks';
import { Spinner } from '@/components/ui/Spinner';
import { useParams } from 'next/navigation';
import Image from 'next/image';

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
      <div className="max-w-4xl mx-auto py-8 text-center text-gray-500">
        الصفحة غير موجودة
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-4">
        {page.coverPhoto ? (
          <img src={page.coverPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-blue-600/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 right-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{page.name}</h1>
          {page.category && (
            <span className="text-sm text-white/80">{page.category}</span>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">{page.likeCount || 0}</span>
            <span className="text-sm">إعجاب</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{page.followerCount || 0}</span>
            <span className="text-sm">متابع</span>
          </div>
        </div>
        
        {page.description && (
          <p className="text-gray-600 mb-4">{page.description}</p>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            disabled={likePage.isPending || unlikePage.isPending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLiked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {likePage.isPending || unlikePage.isPending ? '...' : isLiked ? 'إعجاب ❤️' : 'إعجاب'}
          </button>
          <button
            onClick={handleFollow}
            disabled={followPage.isPending || unfollowPage.isPending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isFollowing
                ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                : 'bg-primary text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {followPage.isPending || unfollowPage.isPending ? '...' : isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">المنشورات</h2>
        {isLoadingPosts ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
            <p className="text-3xl mb-2">📝</p>
            <p>لا توجد منشورات بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center">
                    {page.coverPhoto ? (
                      <img src={page.coverPhoto} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-sm font-bold text-blue-600">{page.name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{page.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                {post.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                )}
                {post.mediaUrl && (
                  <div className="mt-3">
                    <img src={post.mediaUrl} alt="" className="max-h-96 rounded-lg" />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
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