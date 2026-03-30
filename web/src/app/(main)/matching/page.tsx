'use client';
import { MatchList } from '@/features/matching/components/MatchList';

export default function MatchingPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">التوافق</h1>
      <MatchList />
    </div>
  );
}
