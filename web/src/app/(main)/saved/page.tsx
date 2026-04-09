'use client';

import { useSavedItems, useRemoveSaved } from '@/features/memories/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function SavedPage() {
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#213448]">المحفوظات</h1>
        <p className="text-sm text-[#547792] mt-1">العناصر التي حفظتها لإعادةمشاهدتها لاحقاً</p>
      </div>

      {savedLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !savedData?.data || savedData.data.length === 0 ? (
        <Card variant="warm">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-3">🔖</div>
            <p className="text-[#547792]">لا توجد عناصر محفوظة</p>
            <p className="text-sm text-[#BFB9AD] mt-1">احفظ المنشورات والصور والفيديوهات لتجدها لاحقاً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedData.data.map((item: any) => (
            <Card key={item.id} variant="warm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {item.entityType === 'post' && item.entity && (
                      <PostCard post={item.entity} />
                    )}
                    {item.entityType === 'video' && item.entity && (
                      <div className="flex gap-4 p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
                        <div className="w-32 h-20 bg-[#D4E8EE] rounded-lg flex items-center justify-center text-2xl">▶️</div>
                        <div>
                          <p className="font-semibold text-[#213448]">{item.entity.title || 'فيديو'}</p>
                          <p className="text-sm text-[#547792]">تم الحفظ في {formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                    )}
                    {item.entityType === 'story' && item.entity && (
                      <div className="flex gap-4 p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
                        <div className="w-32 h-20 bg-[#D4E8EE] rounded-lg flex items-center justify-center text-2xl">📸</div>
                        <div>
                          <p className="font-semibold text-[#213448]">قصة</p>
                          <p className="text-sm text-[#547792]">تم الحفظ في {formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSaved(item.id)}
                    className="text-[#B05252] hover:bg-[#B05252]/10"
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}