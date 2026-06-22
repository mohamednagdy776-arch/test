import { useMemories } from '../hooks';
import { MemoryCard } from './MemoryCard';
import { Spinner } from '@/components/ui/Spinner';

export function MemoriesList() {
  const { data: memories, isLoading, error } = useMemories();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--destructive)]">
        Failed to load memories
      </div>
    );
  }

  if (!memories?.length) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No memories yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {memories.map((memory: any) => (
        <MemoryCard 
          key={memory.id} 
          memory={memory}
        />
      ))}
    </div>
  );
}
