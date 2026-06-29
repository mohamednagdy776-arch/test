'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, UploadSimple, X, FilmSlate } from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useUploadVideo } from '@/features/videos/hooks';

export default function VideoUploadPage() {
  const router = useRouter();
  const uploadVideo = useUploadVideo();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'رفع فيديو | طيبت';
    return () => { document.title = 'طيبت'; };
  }, []);

  // Revoke object URLs to avoid leaking memory between selections.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('الرجاء اختيار ملف فيديو صالح');
      return;
    }
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) { setError('الرجاء اختيار ملف فيديو'); return; }
    if (!title.trim()) { setError('الرجاء إدخال عنوان للفيديو'); return; }

    try {
      await uploadVideo.mutateAsync({
        file,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.push('/watch');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'تعذر رفع الفيديو، حاول مرة أخرى',
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        icon={PlayCircle}
        eyebrow="المشاهدة"
        title="رفع فيديو"
        subtitle="شارك فيديو جديدًا مع مجتمعك"
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-5 space-y-5"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* File picker / preview */}
        {!file ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-colors"
            style={{ border: '2px dashed var(--border)', backgroundColor: 'var(--muted)' }}
          >
            <UploadSimple size={36} weight="bold" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              اضغط لاختيار ملف فيديو
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              MP4 أو WebM أو MOV — حتى 50 ميغابايت
            </span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <video
              src={previewUrl ?? ''}
              controls
              className="w-full aspect-video bg-black"
            />
            <button
              type="button"
              onClick={clearFile}
              aria-label="إزالة الفيديو"
              className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            العنوان
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان الفيديو"
            maxLength={120}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            الوصف <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>(اختياري)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="أضف وصفًا للفيديو"
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: 'var(--destructive)' }}>{error}</p>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push('/watch')} disabled={uploadVideo.isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" loading={uploadVideo.isPending} disabled={!file || !title.trim()}>
            <FilmSlate size={16} weight="bold" /> نشر الفيديو
          </Button>
        </div>
      </form>
    </div>
  );
}
