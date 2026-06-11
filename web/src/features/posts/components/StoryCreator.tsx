'use client';
import { useState, useRef } from 'react';
import { useCreateStory } from '../hooks';
import { postsApi } from '../api';
import { cn } from '@/lib/utils';

const COLORS = [
  '#131F2E', '#213448', '#547792', '#94B4C1',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#FDFAF5',
];

interface StoryCreatorProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function StoryCreator({ onClose, onSuccess }: StoryCreatorProps) {
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#213448');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createStory = useCreateStory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleSubmit = async () => {
    const data: any = {};

    if (mediaType === 'text') {
      data.text = text;
      data.bgColor = bgColor;
    } else if (mediaFile) {
      setIsUploading(true);
      try {
        const uploaded = await postsApi.uploadMedia(mediaFile);
        data.mediaUrl = uploaded.data?.url;
        data.mediaType = mediaType;
      } finally {
        setIsUploading(false);
      }
    }

    await createStory.mutateAsync(data);
    onSuccess?.();
    onClose();
  };

  const tabs: { value: 'text' | 'image' | 'video'; label: string; icon: string }[] = [
    { value: 'text', label: 'نص', icon: '✏️' },
    { value: 'image', label: 'صورة', icon: '🖼️' },
    { value: 'video', label: 'فيديو', icon: '🎬' },
  ];

  const previewTextSize =
    text.length > 80 ? 'text-base' : text.length > 40 ? 'text-lg' : 'text-2xl';

  const isLight = bgColor === '#FDFAF5' || bgColor === '#FFEAA7';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-[#131F2E]/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-sm mx-4 bg-[#FDFAF5] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#C8D8DF]/50 flex-shrink-0">
          <h3 className="text-base font-bold text-[#213448]">إنشاء قصة</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#EAE0CF] text-[#547792] hover:text-[#213448] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setMediaType(tab.value); setMediaPreview(null); setMediaFile(null); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  mediaType === tab.value
                    ? 'bg-[#213448] text-[#FDFAF5] shadow-md'
                    : 'bg-[#EAE0CF] text-[#547792] hover:bg-[#D4E8EE]'
                )}
              >
                <span className="text-sm leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Text story ── */}
          {mediaType === 'text' && (
            <div className="space-y-3">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="اكتب شيئاً..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-[#C8D8DF] bg-white text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20 resize-none"
              />

              {/* Color picker */}
              <div>
                <p className="text-[11px] font-semibold text-[#547792] mb-2 uppercase tracking-wide">لون الخلفية</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      className="relative h-9 w-9 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{
                        backgroundColor: c,
                        border: '2px solid transparent',
                        boxShadow: bgColor === c
                          ? '0 0 0 2px #FDFAF5, 0 0 0 4px #213448'
                          : '0 0 0 1px #C8D8DF',
                      }}
                    >
                      {bgColor === c && (
                        <svg className="absolute inset-0 m-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={isLight && c === bgColor ? '#131F2E' : 'white'} strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview — 3:4 ratio keeps the modal compact */}
              <div
                className="w-full aspect-[3/4] rounded-xl flex items-center justify-center p-8 shadow-inner"
                style={{ backgroundColor: bgColor }}
              >
                <p
                  className={cn('font-bold text-center drop-shadow leading-snug transition-all', previewTextSize)}
                  style={{ color: isLight ? '#131F2E' : '#FDFAF5' }}
                >
                  {text || 'مثال على النص'}
                </p>
              </div>
            </div>
          )}

          {/* ── Image / Video ── */}
          {mediaType !== 'text' && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept={mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/gif,image/webp'}
                className="hidden"
                onChange={handleFileChange}
              />
              {!mediaPreview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[3/4] rounded-xl bg-[#EAE0CF] flex flex-col items-center justify-center gap-4 text-[#547792] hover:bg-[#D4E8EE] transition-colors border-2 border-dashed border-[#C8D8DF] hover:border-[#547792]"
                >
                  <div className="h-16 w-16 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                    {mediaType === 'video' ? (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 7.5h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
                      </svg>
                    ) : (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">
                      {mediaType === 'video' ? 'اضغط لإضافة فيديو' : 'اضغط لإضافة صورة'}
                    </p>
                    <p className="text-xs text-[#547792]/60 mt-1">
                      {mediaType === 'video' ? 'MP4, WebM, MOV' : 'JPG, PNG, GIF, WebP'}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden relative">
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => { setMediaPreview(null); setMediaFile(null); }}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isUploading || createStory.isPending || (mediaType === 'text' && !text) || (mediaType !== 'text' && !mediaFile)}
            className="w-full py-3 rounded-xl text-[#FDFAF5] font-semibold disabled:opacity-40 transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(to right, #213448, #547792)' }}
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري رفع الملف...
              </>
            ) : createStory.isPending ? (
              <>
                <svg className="h-4 w-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                جاري النشر...
              </>
            ) : (
              'إضافة للقصة'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
