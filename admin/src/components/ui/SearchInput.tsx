'use client';
interface SearchInputProps { value: string; onChange: (v: string) => void; placeholder?: string; }

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }: SearchInputProps) => (
  <div className="relative">
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BFB9AD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] py-2.5 pl-4 pr-10 text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792] transition-all duration-200" />
  </div>
);
