'use client';
import { GroupList } from '@/features/groups/components/GroupList';

export default function GroupsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">المجتمعات</h1>
      <GroupList />
    </div>
  );
}
