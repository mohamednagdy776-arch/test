'use client';

import { useState } from 'react';
import { useArchivedPosts, useArchivedStories, useArchivePost, useArchiveStory } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { StoryViewer } from '@/features/posts/components/StoryViewer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { resolveMediaUrl } from '@/lib/media';
import { Archive as ArchiveIcon } from '@phosphor-icons/react';
import { useT } from '@/i18n/I18nProvider';

type Tab = 'posts' | 'stories';

export default function ArchivePage() {
  const { t } = useT();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('posts');
  const [activeStory, setActiveStory] = useState<any>(null);

  const { data: postsData, isLoading: postsLoading } = useArchivedPosts();
  const { data: storiesData, isLoading: storiesLoading } = useArchivedStories();
  const archivePost = useArchivePost();
  const archiveStory = useArchiveStory();

  const posts = postsData?.data ?? [];
  const stories = storiesData?.data ?? [];

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleUnarchivePost = async (postId: string) => {
    try {
      await archivePost.mutateAsync(postId);
      showToast(t('archive.unarchiveSuccess'), 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || t('archive.unarchiveError'), 'error');
    }
  };

  const handleUnarchiveStory = async (storyId: string) => {
    try {
      await archiveStory.mutateAsync(storyId);
      showToast(t('archive.unarchiveSuccess'), 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || t('archive.unarchiveError'), 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        icon={ArchiveIcon}
        eyebrow={t('archive.eyebrow')}
        title={t('nav.archive')}
        subtitle={t('archive.subtitle')}
      />

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-[var(--muted)]">
        <button
          type="button"
          onClick={() => setTab('posts')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'posts' ? 'bg-[var(--card)] text-[var(--foreground)] shadow' : 'text-[var(--primary)]/60'
          }`}
        >
          {t('archive.tabPosts')}
        </button>
        <button
          type="button"
          onClick={() => setTab('stories')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'stories' ? 'bg-[var(--card)] text-[var(--foreground)] shadow' : 'text-[var(--primary)]/60'
          }`}
        >
          {t('archive.tabStories')}
        </button>
      </div>

      {tab === 'posts' && (
        postsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-[var(--primary)]">{t('archive.emptyPosts')}</p>
              <p className="text-sm text-[var(--primary)]/60 mt-1">{t('archive.emptyPostsHint')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post.id} className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
                <CardContent className="p-5 space-y-3">
                  <PostCard post={post} />
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnarchivePost(post.id)}
                      loading={archivePost.isPending}
                      className="text-[var(--primary)]"
                    >
                      {t('archive.unarchive')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'stories' && (
        storiesLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stories.length === 0 ? (
          <Card className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-[var(--primary)]">{t('archive.emptyStories')}</p>
              <p className="text-sm text-[var(--primary)]/60 mt-1">{t('archive.emptyStoriesHint')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stories.map((story: any) => (
              <Card key={story.id} className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveStory(story)}
                      className="flex gap-4 flex-1 text-right hover:opacity-90 transition-opacity"
                    >
                      <div className="w-20 h-32 rounded-xl overflow-hidden shrink-0 relative bg-gradient-to-br from-[var(--muted)] to-[var(--accent)]/20 flex items-center justify-center text-2xl">
                        {(story.thumbnailUrl || story.mediaUrl) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveMediaUrl(story.thumbnailUrl || story.mediaUrl) ?? ''}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : '📸'}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{story.text || t('saved.story')}</p>
                        <p className="text-sm text-[var(--primary)]/60">{t('archive.archivedOn', { date: formatDate(story.createdAt) })}</p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnarchiveStory(story.id)}
                      loading={archiveStory.isPending}
                      className="text-[var(--primary)] shrink-0"
                    >
                      {t('archive.unarchive')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeStory && (
        <StoryViewer
          stories={[{ user: activeStory.user, stories: [activeStory] }]}
          initialUserIndex={0}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}
