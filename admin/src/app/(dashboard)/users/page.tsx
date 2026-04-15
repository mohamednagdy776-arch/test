'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProfileModal } from '@/components/users/ProfileModal';
import { useUsers, useSearchUsers, useBanUser, useUnbanUser } from '@/features/users/hooks';
import { useCreateConversation } from '@/features/chat/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { User, UserProfile, SearchParams } from '@/types';

export default function UsersPage() {
  const router = useRouter();
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chattingUser, setChattingUser] = useState<UserProfile | null>(null);

  // Advanced search filters
  const [advancedFilters, setAdvancedFilters] = useState<SearchParams>({
    name: '',
    gender: '',
    country: '',
    city: '',
    sect: '',
    lifestyle: '',
    education: '',
    prayerLevel: '',
    minAge: undefined,
    maxAge: undefined,
  });

  // Build search params
  const buildSearchParams = (): SearchParams => {
    const params: SearchParams = {
      page,
      limit: 20,
    };

    // Only add non-empty values
    if (search) params.name = search;
    if (statusFilter) params.gender = statusFilter; // Reusing for status if needed
    if (roleFilter) params.education = roleFilter; // Reusing for role if needed
    if (advancedFilters.gender) params.gender = advancedFilters.gender;
    if (advancedFilters.country) params.country = advancedFilters.country;
    if (advancedFilters.city) params.city = advancedFilters.city;
    if (advancedFilters.sect) params.sect = advancedFilters.sect;
    if (advancedFilters.lifestyle) params.lifestyle = advancedFilters.lifestyle;
    if (advancedFilters.education) params.education = advancedFilters.education;
    if (advancedFilters.prayerLevel) params.prayerLevel = advancedFilters.prayerLevel;
    if (advancedFilters.minAge) params.minAge = advancedFilters.minAge;
    if (advancedFilters.maxAge) params.maxAge = advancedFilters.maxAge;

    return params;
  };

  // Use search hook if any advanced filters are set, otherwise use basic list
  const hasAdvancedFilters = Object.values(advancedFilters).some(v => v !== '' && v !== undefined);
  
  const { data, isLoading, isError } = useSearchUsers(
    hasAdvancedFilters ? buildSearchParams() : { page, limit: 20 }
  );
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const createConversation = useCreateConversation();
  const { toast } = useToast();

  // Filter basic users for display (when not using advanced search)
  const filtered = (data?.data ?? []).filter((u: UserProfile) => {
    const matchSearch = !search || 
      (u.email && u.email.includes(search)) || 
      (u.phone && u.phone.includes(search)) ||
      (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || u.status === statusFilter;
    const matchRole = !roleFilter || u.accountType === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const handleBanToggle = async () => {
    if (!confirmUser) return;
    try {
      if (confirmUser.status === 'banned') {
        await unbanUser.mutateAsync(confirmUser.id);
        toast(`${confirmUser.email} unbanned`);
      } else {
        await banUser.mutateAsync(confirmUser.id);
        toast(`${confirmUser.email} banned`, 'error');
      }
    } catch {
      toast('Action failed', 'error');
    } finally {
      setConfirmUser(null);
    }
  };

  const handleAdvancedFilterChange = (key: keyof SearchParams, value: string | number | undefined) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setRoleFilter('');
    setAdvancedFilters({
      name: '',
      gender: '',
      country: '',
      city: '',
      sect: '',
      lifestyle: '',
      education: '',
      prayerLevel: '',
      minAge: undefined,
      maxAge: undefined,
    });
  };

  const handleStartChat = async (user: UserProfile) => {
    setChattingUser(user);
    try {
      const conversation = await createConversation.mutateAsync(user.id);
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email.split('@')[0];
      toast(`Starting chat with ${userName}`);
      // Navigate to chat page with the conversation ID
      router.push(`/chat?conversationId=${conversation.conversationId}&userId=${user.id}`);
    } catch {
      toast('Failed to start chat', 'error');
    } finally {
      setChattingUser(null);
    }
  };

  const hasActiveFilters = search || statusFilter || roleFilter || hasAdvancedFilters;

  const columns = [
    { header: 'Name', accessor: (u: UserProfile) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
          {u.firstName?.[0] || u.email?.[0] || '?'}
        </div>
        <div>
          <button 
            onClick={() => setProfileUserId(u.id)} 
            className="text-primary hover:underline text-left font-medium"
          >
            {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email.split('@')[0]}
          </button>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      </div>
    )},
    { header: 'Gender', accessor: (u: UserProfile) => u.gender ? (
      <Badge label={u.gender} variant="default" />
    ) : '-'},
    { header: 'Location', accessor: (u: UserProfile) => (
      <span className="text-sm">
        {u.city && u.country ? `${u.city}, ${u.country}` : u.country || u.city || '-'}
      </span>
    )},
    { header: 'Sect', accessor: (u: UserProfile) => u.sect || '-'},
    { header: 'Education', accessor: (u: UserProfile) => u.education || '-'},
    { header: 'Prayer', accessor: (u: UserProfile) => u.prayerLevel ? (
      <Badge 
        label={u.prayerLevel} 
        variant={u.prayerLevel === 'always' ? 'success' : u.prayerLevel === 'sometimes' ? 'warning' : 'default'} 
      />
    ) : '-'},
    { header: 'Role', accessor: (u: UserProfile) => (
      <Badge label={u.accountType} variant={u.accountType === 'admin' ? 'danger' : 'default'} />
    )},
    { header: 'Status', accessor: (u: UserProfile) => (
      <Badge label={u.status} variant={u.status === 'active' ? 'success' : u.status === 'banned' ? 'danger' : 'warning'} />
    )},
    { header: 'Joined', accessor: (u: UserProfile) => new Date(u.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (u: UserProfile) => (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          onClick={() => setProfileUserId(u.id)}
          className="text-xs px-2 py-1 text-primary"
        >
          View Profile
        </Button>
        <Button
          variant="outline"
          onClick={() => handleStartChat(u)}
          className="text-xs px-2 py-1 text-primary border-primary hover:bg-primary/10"
          disabled={createConversation.isPending && chattingUser?.id === u.id}
        >
          {createConversation.isPending && chattingUser?.id === u.id ? 'Starting...' : 'Start Chat'}
        </Button>
        <Button
          variant={u.status === 'banned' ? 'ghost' : 'danger'}
          onClick={() => setConfirmUser(u as unknown as User)}
          className="text-xs px-2 py-1"
        >
          {u.status === 'banned' ? 'Unban' : 'Ban'}
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <span className="text-sm text-slate-500">{data?.meta?.total ?? 0} total</span>
      </div>

      {/* Basic Filters */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone..." />
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Banned', value: 'banned' },
          ]}
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="All roles"
          options={[
            { label: 'User', value: 'user' },
            { label: 'Guardian', value: 'guardian' },
            { label: 'Agent', value: 'agent' },
            { label: 'Admin', value: 'admin' },
          ]}
        />
        <Button
          variant={showAdvanced ? 'primary' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm"
        >
          {showAdvanced ? 'Hide' : 'Advanced'} Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearFilters} className="text-sm text-gray-500">
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Search Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Select
              value={advancedFilters.gender || ''}
              onChange={(v) => handleAdvancedFilterChange('gender', v)}
              placeholder="Gender"
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ]}
            />
            <input
              type="text"
              value={advancedFilters.country || ''}
              onChange={(e) => handleAdvancedFilterChange('country', e.target.value)}
              placeholder="Country"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={advancedFilters.city || ''}
              onChange={(e) => handleAdvancedFilterChange('city', e.target.value)}
              placeholder="City"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={advancedFilters.sect || ''}
              onChange={(e) => handleAdvancedFilterChange('sect', e.target.value)}
              placeholder="Sect"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={advancedFilters.lifestyle || ''}
              onChange={(e) => handleAdvancedFilterChange('lifestyle', e.target.value)}
              placeholder="Lifestyle"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={advancedFilters.education || ''}
              onChange={(e) => handleAdvancedFilterChange('education', e.target.value)}
              placeholder="Education"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Select
              value={advancedFilters.prayerLevel || ''}
              onChange={(v) => handleAdvancedFilterChange('prayerLevel', v)}
              placeholder="Prayer Level"
              options={[
                { label: 'Never', value: 'never' },
                { label: 'Sometimes', value: 'sometimes' },
                { label: 'Always', value: 'always' },
              ]}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={advancedFilters.minAge || ''}
                onChange={(e) => handleAdvancedFilterChange('minAge', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min Age"
                min="18"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={advancedFilters.maxAge || ''}
                onChange={(e) => handleAdvancedFilterChange('maxAge', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max Age"
                min="18"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      )}

      {isError && <ErrorMessage className="mb-4" />}

      <Table 
        columns={columns} 
        data={filtered} 
        loading={isLoading} 
        emptyMessage={hasActiveFilters ? "No users match your search criteria." : "No users found."} 
      />

      <Pagination 
        page={page} 
        totalPages={data?.meta?.totalPages ?? 1} 
        onNext={nextPage} 
        onPrev={prevPage} 
        onPage={goToPage} 
      />

      <ConfirmDialog
        open={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleBanToggle}
        title={confirmUser?.status === 'banned' ? 'Unban User' : 'Ban User'}
        message={`Are you sure you want to ${confirmUser?.status === 'banned' ? 'unban' : 'ban'} ${confirmUser?.email}?`}
        confirmLabel={confirmUser?.status === 'banned' ? 'Unban' : 'Ban'}
        loading={banUser.isPending || unbanUser.isPending}
      />

      <ProfileModal
        userId={profileUserId}
        open={!!profileUserId}
        onClose={() => setProfileUserId(null)}
      />
    </div>
  );
}
