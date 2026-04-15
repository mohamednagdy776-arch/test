'use client';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export const Table = <T extends { id: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'No data found.',
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-emerald-50/50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.header)}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String(row[col.accessor] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
