'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface AiStats {
  coldStartCount: number;
  averageScore: number;
  dailySuggestions: number;
  modelVersion: number;
  scoreDistribution: { bucket: string; count: number }[];
}

const DEFAULT_STATS: AiStats = {
  coldStartCount: 0,
  averageScore: 0,
  dailySuggestions: 0,
  modelVersion: 1,
  scoreDistribution: [],
};

export function AiMatchingStats() {
  const [stats, setStats] = useState<AiStats | null>(null);

  useEffect(() => {
    apiClient
      .get('/admin/ai/stats')
      .then((r) => setStats(r.data?.data ?? r.data ?? DEFAULT_STATS))
      .catch(() => setStats(DEFAULT_STATS));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Matching Statistics</h1>
      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Compatibility Score</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.dailySuggestions}</div>
            <div className="text-sm text-gray-500 mt-1">Daily Suggestions</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.coldStartCount}</div>
            <div className="text-sm text-gray-500 mt-1">Cold-Start Users</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">v{stats.modelVersion}</div>
            <div className="text-sm text-gray-500 mt-1">Model Version</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">Loading statistics...</div>
      )}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Bias Monitoring Note</h2>
        <p className="text-sm text-gray-500">Full bias monitoring requires production data pipeline. Demographic analysis available in monthly audit reports.</p>
      </div>
    </div>
  );
}
