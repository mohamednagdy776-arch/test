'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';

export const PagesList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => apiClient.get('/pages').then(res => res.data),
  });

  if (isLoading) return <Spinner />;

  const pages = data?.data || [];

  return (
    <div className="space-y-3">
      {pages.length === 0 ? (
        <p className="text-center text-gray-500 py-8">لا توجد صفحات</p>
      ) : (
        pages.map((page: any) => (
          <div key={page.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {page.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/pages/${page.id}`} className="font-medium text-gray-900 hover:text-blue-600 block truncate">
                {page.name}
              </Link>
              <p className="text-xs text-gray-500">{page.followerCount || 0} متابع</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
              متابعة
            </button>
          </div>
        ))
      )}
    </div>
  );
};