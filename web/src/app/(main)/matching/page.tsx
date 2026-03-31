'use client';
import { useState } from 'react';
import { MatchingStats } from '@/features/matching/components/MatchingStats';
import { MatchingTabs } from '@/features/matching/components/MatchingTabs';

export default function MatchingPage() {
  const [tab, setTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">التوافق</h1>
      </div>
      <MatchingStats />
      <MatchingTabs activeTab={tab} onTabChange={setTab} />
    </div>
  );
}
