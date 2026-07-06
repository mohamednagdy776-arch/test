'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSavedItems, useRemoveSaved } from '@/features/memories/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { VideoCard } from '@/features/videos/components/VideoGrid';
import { StoryViewer } from '@/features/posts/components/StoryViewer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { resolveMediaUrl } from '@/lib/media';
import { BookmarkSimple } from '@phosphor-icons/react';

export default function SavedPage() {
  const router = useRouter();
  const { data: savedData, isLoading: savedLoading } = useSavedItems();
  const removeSaved = useRemoveSaved();
  const { showToast } = useToast();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  // Saved videos/stories rendered a static "▶️ name / date" placeholder with
  // no image and nothing clickable — reporters saw that as "cannot be opened,
  // no thumbnail" (#80/#140). Wire the real thumbnail + a way to open each.
  const [activeStory, setActiveStory] = useState<any>(null);

  const handleRemoveSaved = async () => {
    if (!pendingRemoveId) return;
    try {
      await removeSaved.mutateAsync(pendingRemoveId);
      showToast('تمت إزالة العنصر من المحفوظات', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل إزالة العنصر', 'error');
    } finally {
      setPendingRemoveId(null);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        icon={BookmarkSimple}
        eyebrow="مجموعتك"
        title="المحفوظات"
        subtitle="العناصر التي حفظتها لإعادة مشاهدتها لاحقاً"
      />

      {savedLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !savedData?.data || savedData.data.length === 0 ? (
        <Card className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-3">🔖</div>
            <p className="text-[var(--primary)]">لا توجد عناصر محفوظة</p>
            <p className="text-sm text-[var(--primary)]/60 mt-1">احفظ المنشورات والصور والفيديوهات لتجدها لاحقاً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedData.data.map((item: any) => (
            <Card key={item.id} className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {item.entityType === 'post' && item.entity && (
                      <PostCard post={item.entity} />
                    )}
                    {item.entityType === 'video' && item.entity && (
                      <div className="flex gap-4 items-center">
                        <div className="w-32 shrink-0">
                          <VideoCard
                            video={{ ...item.entity, thumbnailUrl: item.entity.thumbnail }}
                            onClick={() => router.push(`/watch/${item.entity.id}`)}
                          />
                        </div>
                        <p className="text-sm text-[var(--primary)]/60">تم الحفظ في {formatDate(item.savedAt)}</p>
                      </div>
                    )}
                    {item.entityType === 'story' && item.entity && (
                      <button
                        type="button"
                        onClick={() => setActiveStory(item.entity)}
                        className="flex gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] w-full text-right hover:opacity-90 transition-opacity"
                      >
                        <div className="w-20 h-32 rounded-xl overflow-hidden shrink-0 relative bg-gradient-to-br from-[var(--muted)] to-[var(--accent)]/20 flex items-center justify-center text-2xl">
                          {(item.entity.thumbnailUrl || item.entity.mediaUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveMediaUrl(item.entity.thumbnailUrl || item.entity.mediaUrl) ?? ''}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : '📸'}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">قصة</p>
                          <p className="text-sm text-[var(--primary)]/60">تم الحفظ في {formatDate(item.savedAt)}</p>
                        </div>
                      </button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingRemoveId(item.id)}
                    className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeStory && (
        <StoryViewer
          stories={[{ user: activeStory.user, stories: [activeStory] }]}
          initialUserIndex={0}
          onClose={() => setActiveStory(null)}
        />
      )}

      <Modal open={!!pendingRemoveId} onClose={() => setPendingRemoveId(null)} title="إزالة من المحفوظات">
        <div className="space-y-4">
          <p className="text-sm text-[var(--primary)]">هل أنت متأكد من إزالة هذا العنصر من المحفوظات؟</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setPendingRemoveId(null)} className="flex-1 text-[var(--primary)]">إلغاء</Button>
            <Button variant="danger" onClick={handleRemoveSaved} loading={removeSaved.isPending} className="flex-1">إزالة</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}