'use client';
import { useState, useEffect } from 'react';

interface AffiliateSummary {
  id: string;
  code: string;
  type: string;
  status: string;
  totalReferrals: number;
  totalEarnings: number;
  isFlagged: boolean;
}

export function AffiliateDashboard() {
  const [affiliates, setAffiliates] = useState<AffiliateSummary[]>([]);

  useEffect(() => {
    fetch('/api/v1/admin/affiliates', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(r => r.json())
      .then(data => setAffiliates(Array.isArray(data) ? data : []))
      .catch(() => setAffiliates([]));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Affiliate Performance Dashboard</h1>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Referrals</th>
              <th className="px-4 py-3 text-right">Earnings</th>
              <th className="px-4 py-3 text-left">Flag</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium">{a.code}</td>
                <td className="px-4 py-3 capitalize">{a.type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{a.totalReferrals}</td>
                <td className="px-4 py-3 text-right">${(a.totalEarnings || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {a.isFlagged && <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Flagged</span>}
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No affiliates yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
