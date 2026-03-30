'use client';

import { StatCard } from '@/components/ui/StatCard';
import { useUsers } from '@/features/users/hooks';
import { useMatches } from '@/features/matching/hooks';
import { useGroups } from '@/features/groups/hooks';
import { usePayments } from '@/features/payments/hooks';

export default function DashboardPage() {
  const { data: users } = useUsers(1);
  const { data: matches } = useMatches(1);
  const { data: groups } = useGroups(1);
  const { data: payments } = usePayments(1);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users?.meta.total ?? '—'}
          sub="Registered accounts"
          color="blue"
        />
        <StatCard
          label="Total Matches"
          value={matches?.meta.total ?? '—'}
          sub="All time"
          color="green"
        />
        <StatCard
          label="Groups"
          value={groups?.meta.total ?? '—'}
          sub="Active communities"
          color="yellow"
        />
        <StatCard
          label="Transactions"
          value={payments?.meta.total ?? '—'}
          sub="All payments"
          color="red"
        />
      </div>
    </div>
  );
}
