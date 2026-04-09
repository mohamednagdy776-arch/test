'use client';
import { useState, useRef } from 'react';
import { useCreateStory } from '../hooks';
import { cn } from '@/lib/utils';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#131F2E', '#213448', '#547792', '#FDFAF5'];

interface StoryCreatorProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function StoryCreator({ onClose, onSuccess }: StoryCreatorProps) {
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#131F2E');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createStory = useCreateStory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleSubmit = async () => {
    const data: any = {};
    
    if (mediaType === 'text') {
      data.text = text;
      data.bgColor = bgColor;
    } else if (mediaType === 'image') {
      data.mediaUrl = mediaPreview;
      data.mediaType = 'image';
    } else if (mediaType === 'video') {
      data.mediaUrl = mediaPreview;
      data.mediaType = 'video';
    }

    await createStory.mutateAsync(data);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-[#131F2E]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-[#FDFAF5] rounded-2xl p-4 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#213448]">إنشاء قصة</h3>
          <button onClick={onClose} className="text-[#547792] hover:text-[#213448]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['text', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setMediaType(type); setMediaPreview(null); setMediaFile(null); }}
              className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-colors', mediaType === type ? 'bg-[#547792] text-[#FDFAF5]' : 'bg-[#EAE0CF] text-[#547792]')}
            >
              {type === 'text' ? 'نص' : type === 'image' ? 'صورة' : 'فيديو'}
            </button>
          ))}
        </div>

        {mediaType === 'text' && (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب شيئاً..."
              className="w-full p-4 rounded-xl border border-[#C8D8DF] bg-white text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20"
              rows={3}
            />
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={cn('w-8 h-8 rounded-full border-2 transition-transform hover:scale-110', bgColor === color ? 'border-[#213448]' : 'border-transparent')}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="aspect-[9/16] rounded-xl flex items-center justify-center p-4" style={{ backgroundColor: bgColor }}>
              <p className="text-xl font-bold text-center" style={{ color: bgColor === '#FDFAF5' ? '#131F2E' : '#FDFAF5' }}>{text || 'مثال على النص'}</p>
            </div>
          </div>
        )}

        {mediaType !== 'text' && (
          <div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            {!mediaPreview ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-[9/16] rounded-xl bg-[#EAE0CF] flex flex-col items-center justify-center gap-2 text-[#547792] hover:bg-[#D4E8EE] transition-colors"
              >
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                <span className="text-sm font-medium">إضافة {mediaType === 'video' ? 'فيديو' : 'صورة'}</span>
              </button>
            ) : (
              <div className="aspect-[9/16] rounded-xl overflow-hidden relative">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button onClick={() => { setMediaPreview(null); setMediaFile(null); }} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#131F2E]/60 text-white flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={createStory.isPending || (mediaType === 'text' && !text)}
          className="w-full mt-4 py-3 rounded-xl text-[#FDFAF5] font-medium hover:shadow-md disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(to right, #213448, #547792)' }}
        >
          {createStory.isPending ? 'جاري النشر...' : 'إضافة للقصة'}
        </button>
      </div>
    </div>
  );
}