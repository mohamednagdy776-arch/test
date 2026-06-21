import { useSavedItems, useRemoveSaved } from '../hooks';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

export function SavedItemsList() {
  const { data: savedItems, isLoading, error } = useSavedItems();
  const removeSaved = useRemoveSaved();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load saved items
      </div>
    );
  }

  if (!savedItems?.length) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No saved items yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedItems.map((item: any) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start gap-4">
            {item.entity?.mediaUrl && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.entity.mediaUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--foreground)] truncate">
                {item.entity?.content || 'Saved content'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Saved on {new Date(item.savedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => removeSaved.mutate(item.id)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
