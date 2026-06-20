'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMemories, useSavedItems, useRemoveSaved } from '@/features/memories/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

export default function MemoriesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memories' | 'saved'>('memories');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { data: memoriesData, isLoading: memoriesLoading } = useMemories();
  const { data: savedData, isLoading: savedLoading } = useSavedItems();
  const removeSaved = useRemoveSaved();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const handleRemoveSaved = async () => {
    if (!pendingRemoveId) return;
    try {
      await removeSaved.mutateAsync(pendingRemoveId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل إزالة العنصر');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">المحفوظات والذكريات</h1>
        <p className="text-sm text-emerald-600/70 mt-1">راجع ذكرياتك المحفوظة من السنوات السابقة</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-emerald-100/50 pb-px">
        <button
          onClick={() => setActiveTab('memories')}
          className={`px-5 py-2.5 font-semibold transition-all rounded-t-xl ${
            activeTab === 'memories'
              ? 'text-emerald-900 border-b-2 border-emerald-500 bg-gradient-to-r from-emerald-100 to-amber-50'
              : 'text-emerald-600/70 hover:text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          🎞️ ذكريات
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-2.5 font-semibold transition-all rounded-t-xl ${
            activeTab === 'saved'
              ? 'text-emerald-900 border-b-2 border-emerald-500 bg-gradient-to-r from-emerald-100 to-amber-50'
              : 'text-emerald-600/70 hover:text-emerald-800 hover:bg-emerald-50'
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
                <p className="text-emerald-700">لا توجد ذكريات حتى الآن</p>
                <p className="text-sm text-emerald-500/60 mt-1">ستظهر هنا منشوراتك من نفس التاريخ في السنوات السابقة</p>
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
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${!selectedYear ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                    >
                      الكل
                    </button>
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${selectedYear === y ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
                {filtered.map((memory: any, index: number) => (
                  <Card key={memory.id || index} className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] shadow-lg shadow-emerald-500/10 border border-emerald-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-900">
                        <span>📅</span>
                        <span className="text-amber-600 font-semibold">{getRelativeLabel(memory.createdAt)}</span>
                        <span className="text-xs text-emerald-500/60 font-normal">{formatDate(memory.createdAt)}</span>
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
                <p className="text-emerald-700">لا توجد عناصر محفوظة</p>
                <p className="text-sm text-emerald-500/60 mt-1">احفظ المنشورات والصور والفيديوهات لتجدها لاحقاً</p>
              </CardContent>
            </Card>
          ) : (
            savedData.data.map((item: any) => (
              <Card key={item.id} className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] shadow-lg shadow-emerald-500/10 border border-emerald-100">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {item.entityType === 'post' && item.entity && (
                        <PostCard post={item.entity} />
                      )}
                      {item.entityType === 'video' && item.entity && (
                        <button
                          onClick={() => item.entity?.id && router.push(`/videos/${item.entity.id}`)}
                          className="w-full text-right flex gap-4 p-4 rounded-2xl bg-white/80 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all"
                        >
                          <div className="w-32 h-20 shrink-0 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl">▶️</div>
                          <div>
                            <p className="font-semibold text-emerald-900">{item.entity.title || 'فيديو'}</p>
                            <p className="text-sm text-emerald-600/60">تم الحفظ في {formatDate(item.createdAt)}</p>
                          </div>
                        </button>
                      )}
                      {item.entityType === 'story' && item.entity && (
                        <button
                          onClick={() => item.entity?.id && router.push(`/stories/${item.entity.id}`)}
                          className="w-full text-right flex gap-4 p-4 rounded-2xl bg-white/80 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all"
                        >
                          <div className="w-32 h-20 shrink-0 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl">📸</div>
                          <div>
                            <p className="font-semibold text-emerald-900">قصة</p>
                            <p className="text-sm text-emerald-600/60">تم الحفظ في {formatDate(item.createdAt)}</p>
                          </div>
                        </button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingRemoveId(item.id)}
                      className="text-rose-500 hover:bg-rose-50"
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
          <p className="text-sm text-emerald-700">هل أنت متأكد من إزالة هذا العنصر من المحفوظات؟</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setPendingRemoveId(null)} className="flex-1 text-emerald-700">إلغاء</Button>
            <Button variant="danger" onClick={handleRemoveSaved} loading={removeSaved.isPending} className="flex-1">إزالة</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}