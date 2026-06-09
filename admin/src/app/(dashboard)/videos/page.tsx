'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useVideos, useDeleteVideo } from '@/features/videos/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Video } from '@/features/videos/api';

export default function VideosPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [confirmVideo, setConfirmVideo] = useState<Video | null>(null);
  const [detailVideo, setDetailVideo] = useState<Video | null>(null);
  const { data, isLoading, isError } = useVideos(page);
  const deleteVideo = useDeleteVideo();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((v) =>
    !search || v.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmVideo) return;
    try {
      await deleteVideo.mutateAsync(confirmVideo.id);
      toast('Video deleted');
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmVideo(null);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = [
    { header: 'Title', accessor: (v: Video) => (
      <button onClick={() => setDetailVideo(v)} className="text-left text-primary hover:underline">
        {v.title}
      </button>
    )},
    { header: 'Duration', accessor: (v: Video) => formatDuration(v.duration) },
    { header: 'Views', accessor: (v: Video) => v.viewsCount?.toLocaleString() ?? 0 },
    { header: 'Author', accessor: (v: Video) => <span className="font-mono text-xs">{v.userId?.slice(0, 8)}…</span> },
    { header: 'Date', accessor: (v: Video) => new Date(v.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (v: Video) => (
      <Button variant="danger" onClick={() => setConfirmVideo(v)} className="text-xs px-2 py-1">Delete</Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Videos</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total</span>
      </div>
      <div className="mb-4 w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search videos..." />
      </div>
      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No videos found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
      <ConfirmDialog open={!!confirmVideo} onClose={() => setConfirmVideo(null)} onConfirm={handleDelete}
        title="Delete Video" message="Delete this video? This cannot be undone." confirmLabel="Delete" loading={deleteVideo.isPending} />
      <Modal open={!!detailVideo} onClose={() => setDetailVideo(null)} title="Video Details" size="lg">
        {detailVideo && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg">{detailVideo.title}</h3>
              <p className="text-gray-600 mt-2">{detailVideo.description || 'No description'}</p>
            </div>
            {detailVideo.thumbnailUrl && (
              <img src={detailVideo.thumbnailUrl} alt={detailVideo.title} className="w-full max-w-md rounded-lg" />
            )}
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {[['Duration', formatDuration(detailVideo.duration)], ['Views', detailVideo.viewsCount?.toString() ?? '0'], 
                ['Author', detailVideo.userId], ['Created', new Date(detailVideo.createdAt).toLocaleString()]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-medium text-gray-500">{k}</dt><dd className="text-gray-900 font-mono text-xs break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
