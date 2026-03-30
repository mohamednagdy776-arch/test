'use client';

import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useUsers } from '@/features/users/hooks';
import { useMatches } from '@/features/matching/hooks';
import { useGroups } from '@/features/groups/hooks';
import { usePayments } from '@/features/payments/hooks';
import { useReports } from '@/features/reports/hooks';

export default function DashboardPage() {
  const { data: users } = useUsers(1);
  const { data: matches } = useMatches(1);
  const { data: groups } = useGroups(1);
  const { data: payments } = usePayments(1);
  const { data: reports } = useReports(1);

  const pendingReports = reports?.data.filter((r) => r.status === 'pending').length ?? 0;
  const acceptedMatches = matches?.data.filter((m) => m.status === 'accepted').length ?? 0;
  const activeUsers = users?.data.filter((u) => u.status === 'active').length ?? 0;

  const recentUsers = users?.data.slice(0, 5) ?? [];
  const recentMatches = matches?.data.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={users?.meta.total ?? '—'} sub={`${activeUsers} active`} color="blue" />
        <StatCard label="Total Matches" value={matches?.meta.total ?? '—'} sub={`${acceptedMatches} accepted`} color="green" />
        <StatCard label="Groups" value={groups?.meta.total ?? '—'} sub="Active communities" color="yellow" />
        <StatCard label="Pending Reports" value={pendingReports} sub="Needs attention" color="red" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Users */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400">No users yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.email}</p>
                    <p className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    label={u.status}
                    variant={u.status === 'active' ? 'success' : u.status === 'banned' ? 'danger' : 'warning'}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Matches */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Matches</h2>
          {recentMatches.length === 0 ? (
            <p className="text-sm text-gray-400">No matches yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentMatches.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-mono text-xs">{m.user1Id.slice(0, 6)}</span>
                      {' ↔ '}
                      <span className="font-mono text-xs">{m.user2Id.slice(0, 6)}</span>
                    </p>
                    <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{m.score}%</span>
                    <Badge
                      label={m.status}
                      variant={m.status === 'accepted' ? 'success' : m.status === 'rejected' ? 'danger' : 'warning'}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">System Status</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { label: 'Backend API', status: 'online' },
            { label: 'AI Service', status: 'online' },
            { label: 'Database', status: 'online' },
            { label: 'Redis Cache', status: 'online' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
