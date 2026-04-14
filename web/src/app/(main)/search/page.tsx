'use client';
import { SearchPage as SearchPageContent } from '@/features/search/components/SearchPage';

export default function Search() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#059669]">البحث</h1>
      </div>
      <SearchPageContent />
    </div>
  );
}
