'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Lab {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'suspended';
  commercialRegistration: string;
  commissionRate: number;
  integrationActive: boolean;
  createdAt: string;
}

export function LabsManagement() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/labs')
      .then((r) => {
        const payload = r.data;
        // Handle both plain array and wrapped { data: [...] } responses
        const list: Lab[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setLabs(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading labs...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Partner Management</h1>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Lab Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Commission</th>
              <th className="px-4 py-3 text-left">Integration</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {labs.map(lab => (
              <tr key={lab.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{lab.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lab.status === 'active' ? 'bg-green-100 text-green-700' :
                    lab.status === 'suspended' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {lab.status}
                  </span>
                </td>
                <td className="px-4 py-3">{lab.commissionRate}%</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${lab.integrationActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {lab.integrationActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(lab.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {labs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No labs registered yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
