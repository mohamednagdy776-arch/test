'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SearchFilters } from './SearchFilters';
import { UserCard } from './UserCard';
import { UserProfileModal } from './UserProfileModal';

export interface SearchFiltersState {
  name: string;
  gender: string;
  country: string;
  city: string;
  minAge: string;
  maxAge: string;
  sect: string;
  lifestyle: string;
  education: string;
  prayerLevel: string;
}

const empty: SearchFiltersState = {
  name: '', gender: '', country: '', city: '',
  minAge: '', maxAge: '', sect: '', lifestyle: '', education: '', prayerLevel: '',
};

export const SearchPage = () => {
  const [filters, setFilters] = useState<SearchFiltersState>(empty);
  const [applied, setApplied] = useState<SearchFiltersState>(empty);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: '12' };
  Object.entries(applied).forEach(([k, v]) => { if (v) params[k] = v; });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', applied, page],
    queryFn: () => apiClient.get('/users/search', { params }).then((r) => r.data),
  });

  const result = data?.data;
  const users: any[] = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  const handleSearch = () => { setPage(1); setApplied({ ...filters }); };
  const handleReset = () => { setFilters(empty); setApplied(empty); setPage(1); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">البحث عن توافق</h1>
        {total > 0 && <span className="text-sm text-gray-500">{total} نتيجة</span>}
      </div>

      {/* Search bar */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={filters.name}
            onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="ابحث بالاسم..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleSearch}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            بحث
          </button>
          <button onClick={() => setShowAdvanced((v) => !v)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${showAdvanced ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            🔧 متقدم
          </button>
        </div>

        {showAdvanced && (
          <SearchFilters filters={filters} onChange={setFilters} onReset={handleReset} onSearch={handleSearch} />
        )}
      </div>

      {/* Results */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-52 rounded-xl bg-white animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">لا توجد نتائج</p>
          <p className="text-xs mt-1">جرب تغيير معايير البحث</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <UserCard key={u.userId} user={u} onView={() => setSelectedUser(u)} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40">
                ← السابق
              </button>
              <span className="text-sm text-gray-600">صفحة {page} من {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40">
                التالي →
              </button>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};
