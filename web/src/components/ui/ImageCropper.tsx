'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Check, MagnifyingGlassPlus, MagnifyingGlassMinus } from '@phosphor-icons/react';

interface Props {
  file: File;
  aspectRatio?: number;
  circular?: boolean;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

const OUTPUT_SIZE = 512;

export function ImageCropper({ file, aspectRatio = 1, circular = false, onCrop, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const PREVIEW_W = 320;
  const PREVIEW_H = Math.round(PREVIEW_W / aspectRatio);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      const scaleToFit = Math.max(PREVIEW_W / image.width, PREVIEW_H / image.height);
      setScale(scaleToFit);
      setOffset({ x: 0, y: 0 });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);

    ctx.save();
    ctx.translate(PREVIEW_W / 2 + offset.x, PREVIEW_H / 2 + offset.y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);

    if (circular) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(PREVIEW_W / 2, PREVIEW_H / 2, Math.min(PREVIEW_W, PREVIEW_H) / 2 - 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      ctx.translate(PREVIEW_W / 2 + offset.x, PREVIEW_H / 2 + offset.y);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(PREVIEW_W / 2, PREVIEW_H / 2, Math.min(PREVIEW_W, PREVIEW_H) / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const padX = 16, padY = 16;
      ctx.save();
      ctx.beginPath();
      ctx.rect(padX, padY, PREVIEW_W - padX * 2, PREVIEW_H - padY * 2);
      ctx.clip();
      ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      ctx.translate(PREVIEW_W / 2 + offset.x, PREVIEW_H / 2 + offset.y);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(padX, padY, PREVIEW_W - padX * 2, PREVIEW_H - padY * 2);
    }
  }, [img, scale, offset, circular, PREVIEW_W, PREVIEW_H]);

  useEffect(() => { draw(); }, [draw]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
  };

  const handleCrop = () => {
    if (!img || !canvasRef.current) return;
    const out = document.createElement('canvas');
    out.width = OUTPUT_SIZE;
    out.height = Math.round(OUTPUT_SIZE / aspectRatio);
    const ctx = out.getContext('2d')!;

    const scaleX = OUTPUT_SIZE / PREVIEW_W;
    const scaleY = out.height / PREVIEW_H;

    const padX = circular ? 4 : 16;
    const padY = circular ? 4 : 16;
    const cropW = PREVIEW_W - padX * 2;
    const cropH = PREVIEW_H - padY * 2;

    ctx.translate(out.width / 2, out.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(
      (offset.x - padX) * scaleX / scale,
      (offset.y - padY) * scaleY / scale,
    );
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    out.toBlob(
      (blob) => { if (blob) onCrop(blob); },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-[var(--foreground)] text-sm">تعديل الصورة</span>
          <button onClick={onCancel} className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={PREVIEW_W}
            height={PREVIEW_H}
            className="rounded-xl cursor-grab active:cursor-grabbing border border-[var(--border)]"
            style={{ touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />

          <div className="flex items-center gap-3 w-full">
            <MagnifyingGlassMinus size={18} className="text-[var(--muted-foreground)] shrink-0" />
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 accent-[var(--muted-foreground)]"
            />
            <MagnifyingGlassPlus size={18} className="text-[var(--muted-foreground)] shrink-0" />
          </div>
        </div>

        <div className="flex gap-3 px-4 pb-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]/40 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} />
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
