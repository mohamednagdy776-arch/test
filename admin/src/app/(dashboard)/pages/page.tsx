'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { usePages, useDeletePage, useVerifyPage } from '@/features/pages/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Page } from '@/features/pages/api';

export default function PagesPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [confirmPage, setConfirmPage] = useState<Page | null>(null);
  const [detailPage, setDetailPage] = useState<Page | null>(null);
  const { data, isLoading, isError } = usePages(page);
  const deletePage = useDeletePage();
  const verifyPage = useVerifyPage();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmPage) return;
    try {
      await deletePage.mutateAsync(confirmPage.id);
      toast('Page deleted');
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmPage(null);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyPage.mutateAsync(id);
      toast('Page verified');
    } catch {
      toast('Verify failed', 'error');
    }
  };

  const columns = [
    { header: 'Name', accessor: (p: Page) => (
      <button onClick={() => setDetailPage(p)} className="text-left text-primary hover:underline font-semibold">
        {p.name}
      </button>
    )},
    { header: 'Category', accessor: (p: Page) => p.category },
    { header: 'Verified', accessor: (p: Page) => p.isVerified ? <Badge variant="success">Verified</Badge> : <Badge variant="default">Not Verified</Badge> },
    { header: 'Followers', accessor: (p: Page) => p.followersCount?.toLocaleString() ?? 0 },
    { header: 'Owner', accessor: (p: Page) => <span className="font-mono text-xs">{p.ownerId?.slice(0, 8)}…</span> },
    { header: 'Date', accessor: (p: Page) => new Date(p.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (p: Page) => (
      <div className="flex gap-1">
        {!p.isVerified && (
          <Button variant="primary" onClick={() => handleVerify(p.id)} className="text-xs px-2 py-1">Verify</Button>
        )}
        <Button variant="danger" onClick={() => setConfirmPage(p)} className="text-xs px-2 py-1">Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total</span>
      </div>
      <div className="mb-4 w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search pages..." />
      </div>
      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No pages found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
      <ConfirmDialog open={!!confirmPage} onClose={() => setConfirmPage(null)} onConfirm={handleDelete}
        title="Delete Page" message="Delete this page? This cannot be undone." confirmLabel="Delete" loading={deletePage.isPending} />
      <Modal open={!!detailPage} onClose={() => setDetailPage(null)} title="Page Details" size="lg">
        {detailPage && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg">{detailPage.name}</h3>
              <p className="text-gray-600 mt-2">{detailPage.description}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {[['Category', detailPage.category], ['Verified', detailPage.isVerified ? 'Yes' : 'No'], 
                ['Followers', detailPage.followersCount?.toString() ?? '0'], ['Owner', detailPage.ownerId], 
                ['Created', new Date(detailPage.createdAt).toLocaleString()]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-medium text-gray-500">{k}</dt><dd className="text-gray-900 font-mono text-xs break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
