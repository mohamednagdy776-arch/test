'use client';

import { useState } from 'react';
import { useMemories, useSavedItems, useRemoveSaved } from '@/features/memories/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function MemoriesPage() {
  const [activeTab, setActiveTab] = useState<'memories' | 'saved'>('memories');
  const { data: memoriesData, isLoading: memoriesLoading } = useMemories();
  const { data: savedData, isLoading: savedLoading } = useSavedItems();
  const removeSaved = useRemoveSaved();

  const handleRemoveSaved = async (id: string) => {
    if (confirm('هل أنت متأكد من إزالة هذا العنصر من المحفوظات؟')) {
      try {
        await removeSaved.mutateAsync(id);
      } catch (err) {
        console.error('Failed to remove saved item:', err);
      }
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getYearDiff = (date: string) => {
    const postYear = new Date(date).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - postYear;
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
          ) : (
            memoriesData.data.map((memory: any, index: number) => (
              <Card key={memory.id || index} className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] shadow-lg shadow-emerald-500/10 border border-emerald-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <span>📅</span>
                    <span className="text-amber-600 font-semibold">منذ {getYearDiff(memory.createdAt)} سنوات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PostCard post={memory} />
                </CardContent>
              </Card>
            ))
          )}
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
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/80 border border-emerald-100">
                          <div className="w-32 h-20 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl">▶️</div>
                          <div>
                            <p className="font-semibold text-emerald-900">{item.entity.title || 'فيديو'}</p>
                            <p className="text-sm text-emerald-600/60">تم الحفظ في {formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                      )}
                      {item.entityType === 'story' && item.entity && (
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/80 border border-emerald-100">
                          <div className="w-32 h-20 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl">📸</div>
                          <div>
                            <p className="font-semibold text-emerald-900">قصة</p>
                            <p className="text-sm text-emerald-600/60">تم الحفظ في {formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSaved(item.id)}
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
    </div>
  );
}