'use client';

import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useUsers } from '@/features/users/hooks';
import { useMatches } from '@/features/matching/hooks';
import { useGroups } from '@/features/groups/hooks';
import { usePayments } from '@/features/payments/hooks';
import { useReports } from '@/features/reports/hooks';
import type { User, Match } from '@/types';

export default function DashboardPage() {
  const { data: users } = useUsers(1);
  const { data: matches } = useMatches(1);
  const { data: groups } = useGroups(1);
  const { data: payments } = usePayments(1);
  const { data: reports } = useReports(1);

  const pendingReports = reports?.data.filter((r: { status: string }) => r.status === 'pending').length ?? 0;
  const acceptedMatches = matches?.data.filter((m: Match) => m.status === 'accepted').length ?? 0;
  const activeUsers = users?.data.filter((u: User) => u.status === 'active').length ?? 0;

  const recentUsers = users?.data.slice(0, 5) ?? [];
  const recentMatches = matches?.data.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your platform performance</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 shadow-sm">
          <div className="status-online" />
          <span className="text-sm font-medium text-slate-700">All systems operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users?.meta.total ?? '—'}
          sub={`${activeUsers} active`}
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Matches"
          value={matches?.meta.total ?? '—'}
          sub={`${acceptedMatches} accepted`}
          color="green"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          }
        />
        <StatCard
          label="Groups"
          value={groups?.meta.total ?? '—'}
          sub="Active communities"
          color="yellow"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Reports"
          value={pendingReports}
          sub="Needs attention"
          color="red"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

{/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Users</h2>
            <span className="text-xs text-slate-500">{recentUsers.length} shown</span>
          </div>
          {recentUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zm-13.5 0a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-sm text-slate-500">No users yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentUsers.map((u: User) => (
                <li key={u.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 text-xs font-bold text-emerald-700">
                      {u.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{u.email}</p>
                      <p className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Matches</h2>
            <span className="text-xs text-slate-500">{recentMatches.length} shown</span>
          </div>
          {recentMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <p className="text-sm text-slate-500">No matches yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentMatches.map((m: Match) => (
                <li key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{m.user1Id.slice(0, 6)}</span>
                      <span className="mx-1.5 text-slate-400">↔</span>
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{m.user2Id.slice(0, 6)}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-600">{m.score}%</span>
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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">System Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Backend API', status: 'online' },
            { label: 'AI Service', status: 'online' },
            { label: 'Database', status: 'online' },
            { label: 'Redis Cache', status: 'online' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 px-4 py-3">
              <div className="status-online" />
              <div>
                <p className="text-sm font-medium text-slate-900">{s.label}</p>
                <p className="text-xs text-emerald-600">Operational</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
