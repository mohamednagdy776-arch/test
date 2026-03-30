'use client';

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export const Select = ({ value, onChange, options, placeholder, className = '' }: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);
