'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMemories, useSavedItems, useRemoveSaved } from '@/features/memories/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Clock } from '@phosphor-icons/react';

// Saved-video thumbnails had no error fallback -- a broken/unresolved
// thumbnail URL rendered as a broken-image icon instead of falling back to
// the same ▶️ placeholder already used here for videos with no thumbnail at
// all (#420, same class of bug fixed for the Watch grid in #396).
function SavedVideoThumb({ src }: { src?: string | null }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return <>▶️</>;
  return <img src={src} alt="" className="w-full h-full object-cover" onError={() => setErrored(true)} />;
}

export default function MemoriesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memories' | 'saved'>('memories');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { data: memoriesData, isLoading: memoriesLoading } = useMemories();
  const { data: savedData, isLoading: savedLoading } = useSavedItems();
  const removeSaved = useRemoveSaved();
  const { showToast } = useToast();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

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

  // Human-readable relative label that doesn't say "0 years ago" (M-15).
  const getRelativeLabel = (date: string) => {
    const then = new Date(date).getTime();
    const now = Date.now();
    const days = Math.floor((now - then) / 86_400_000);
    if (days < 1) return 'اليوم';
    if (days === 1) return 'منذ يوم';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) {
      const w = Math.floor(days / 7);
      return w === 1 ? 'منذ أسبوع' : `منذ ${w} أسابيع`;
    }
    if (days < 365) {
      const m = Math.floor(days / 30);
      return m === 1 ? 'منذ شهر' : `منذ ${m} أشهر`;
    }
    const years = Math.floor(days / 365);
    return years === 1 ? 'منذ سنة' : `منذ ${years} سنوات`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        icon={Clock}
        eyebrow="ذكرياتك"
        title="المحفوظات والذكريات"
        subtitle="راجع ذكرياتك المحفوظة من السنوات السابقة"
      />

      <div className="flex gap-2 mb-6 mt-6 border-b border-[var(--border)]/50 pb-px">
        <button
          onClick={() => setActiveTab('memories')}
          className={`px-5 py-2.5 font-semibold transition-all rounded-t-xl ${
            activeTab === 'memories'
              ? 'text-[var(--foreground)] border-b-2 border-[var(--ring)] bg-gradient-to-r from-[var(--muted)] to-[var(--accent)]/15'
              : 'text-[var(--primary)]/70 hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
          }`}
        >
          🎞️ ذكريات
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-2.5 font-semibold transition-all rounded-t-xl ${
            activeTab === 'saved'
              ? 'text-[var(--foreground)] border-b-2 border-[var(--ring)] bg-gradient-to-r from-[var(--muted)] to-[var(--accent)]/15'
              : 'text-[var(--primary)]/70 hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
          }`}
        >
          🔖 المحفوظات
        </button>
      </div>

      {activeTab === 'memories' && (
        <div className="space-y-5">
          {memoriesLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !memoriesData?.data || memoriesData.data.length === 0 ? (
            <Card variant="warm">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🎞</div>
                <p className="text-[var(--primary)]">لا توجد ذكريات حتى الآن</p>
                <p className="text-sm text-[var(--primary)]/60 mt-1">ستظهر هنا منشوراتك من نفس التاريخ في السنوات السابقة</p>
              </CardContent>
            </Card>
          ) : (() => {
            const allMemories: any[] = memoriesData.data;
            const years = [...new Set(allMemories.map((m: any) => new Date(m.createdAt).getFullYear()))].sort((a, b) => b - a);
            const filtered = selectedYear ? allMemories.filter((m: any) => new Date(m.createdAt).getFullYear() === selectedYear) : allMemories;
            return (
              <>
                {years.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedYear(null)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${!selectedYear ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--primary)] hover:bg-[var(--border)] border border-[var(--border)]'}`}
                    >
                      الكل
                    </button>
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${selectedYear === y ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--primary)] hover:bg-[var(--border)] border border-[var(--border)]'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
                {filtered.map((memory: any, index: number) => (
                  <Card key={memory.id || index} className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                        <span>📅</span>
                        <span className="text-[var(--accent)] font-semibold">{getRelativeLabel(memory.createdAt)}</span>
                        <span className="text-xs text-[var(--primary)]/60 font-normal">{formatDate(memory.createdAt)}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PostCard post={memory} />
                    </CardContent>
                  </Card>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !savedData?.data || savedData.data.length === 0 ? (
            <Card variant="warm">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🔖</div>
                <p className="text-[var(--primary)]">لا توجد عناصر محفوظة</p>
                <p className="text-sm text-[var(--primary)]/60 mt-1">احفظ المنشورات والصور والفيديوهات لتجدها لاحقاً</p>
              </CardContent>
            </Card>
          ) : (
            savedData.data.map((item: any) => (
              <Card key={item.id} className="bg-[var(--card)] shadow-lg shadow-black/5 border border-[var(--border)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {item.entityType === 'post' && item.entity && (
                        <PostCard post={item.entity} />
                      )}
                      {item.entityType === 'video' && item.entity && (
                        <button
                          // Videos play at /watch/:id -- /videos/:id doesn't
                          // exist and always 404'd (#371).
                          onClick={() => item.entity?.id && router.push(`/watch/${item.entity.id}`)}
                          className="w-full text-right flex gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border)] hover:shadow-md transition-all"
                        >
                          {/* Was a static ▶️ placeholder that never read the
                              video's real thumbnail (#240). */}
                          <div className="w-32 h-20 shrink-0 bg-gradient-to-br from-[var(--muted)] to-[var(--accent)]/20 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                            <SavedVideoThumb src={item.entity.thumbnailUrl} />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">{item.entity.title || 'فيديو'}</p>
                            {/* Read item.createdAt, which doesn't exist on a
                                saved-item row (the field is savedAt) --
                                new Date(undefined) rendered as "Invalid
                                Date" (#370). */}
                            <p className="text-sm text-[var(--primary)]/60">تم الحفظ في {formatDate(item.savedAt)}</p>
                          </div>
                        </button>
                      )}
                      {item.entityType === 'story' && item.entity && (
                        <button
                          onClick={() => item.entity?.id && router.push(`/stories/${item.entity.id}`)}
                          className="w-full text-right flex gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border)] hover:shadow-md transition-all"
                        >
                          <div className="w-32 h-20 shrink-0 bg-gradient-to-br from-[var(--muted)] to-[var(--accent)]/20 rounded-xl flex items-center justify-center text-2xl">📸</div>
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
            ))
          )}
        </div>
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