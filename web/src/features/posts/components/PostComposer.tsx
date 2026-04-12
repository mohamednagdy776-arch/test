'use client';
import { useState, useEffect, useRef } from 'react';
import { useCreatePost, useCreatePostWithMedia, useUploadMedia } from '../hooks';
import { cn } from '@/lib/utils';
import { Palette, Image, Smiley, MapPin, Users, Clock, ChartBar, X, Gear, Heart, Plus, Trash } from '@phosphor-icons/react';

const BACKGROUNDS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

const FEELINGS = [
  { icon: Smiley, label: 'سعيد' },
  { icon: Heart, label: 'محب' },
];

const AUDIENCE_OPTIONS = [
  { value: 'public', label: 'عام', icon: Users },
  { value: 'friends', label: 'أصدقاء', icon: Users },
  { value: 'friends_of_friends', label: 'أصدقاء الأصدقاء', icon: Users },
  { value: 'only_me', label: 'أنا فقط', icon: Gear },
];

interface PostComposerProps {
  groupId?: string;
  onSuccess?: () => void;
}

export function PostComposer({ groupId, onSuccess }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<{ icon: any; label: string } | null>(null);
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState('friends');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  
  const createPost = useCreatePost();
  const createPostWithMedia = useCreatePostWithMedia();
  const uploadMedia = useUploadMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile && !pollQuestion.trim()) return;

    let mediaUrl: string | undefined;
    if (mediaFile) {
      const uploadResult = await uploadMedia.mutateAsync(mediaFile);
      mediaUrl = uploadResult.data?.url;
    }

    const scheduledAt = scheduleDate && scheduleTime 
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() 
      : undefined;

    let pollOpts: { text: string; votes: number }[] | undefined;
    if (pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      pollOpts = pollOptions.filter(o => o.trim()).map(o => ({ text: o, votes: 0 }));
    }

    await createPost.mutateAsync({
      groupId: groupId || '',
      content: content.trim(),
      mediaUrl,
      bgColor: bgColor || undefined,
      feeling: feeling?.label || undefined,
      location: location || undefined,
      audience: audience as any,
      scheduledAt,
      pollOptions: pollOpts,
      postType: pollOpts ? 'poll' : undefined,
    });
    
    resetForm();
    onSuccess?.();
  };

  const resetForm = () => {
    setContent('');
    setBgColor(null);
    setFeeling(null);
    setLocation('');
    setAudience('friends');
    setMediaPreview(null);
    setMediaFile(null);
    setScheduleDate('');
    setScheduleTime('');
    setTaggedUsers([]);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setMediaFile(file);
    }
  };

  const handleTagAdd = (userId: string) => {
    if (!taggedUsers.includes(userId)) {
      setTaggedUsers([...taggedUsers, userId]);
    }
    setTagSearch('');
    setShowTagInput(false);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="rounded-2xl bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-[#FDFAF5] font-bold" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>أ</div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="على ما يدور ذهنك؟"
              className={cn(
                'w-full resize-none border-none bg-transparent text-sm text-[#131F2E] placeholder:text-[#BFB9AD] focus:outline-none transition-all',
                bgColor ? 'text-center text-lg font-medium py-8' : 'py-2 min-h-[80px]'
              )}
              style={bgColor ? { backgroundColor: bgColor, borderRadius: '12px', color: '#FDFAF5' } : {}}
              rows={bgColor ? 3 : 3}
            />
          </div>
        </div>

        {mediaPreview && (
          <div className="mt-3 relative">
            <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-xl" />
            <button type="button" onClick={() => { setMediaPreview(null); setMediaFile(null); }} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#131F2E]/60 text-[#FDFAF5] flex items-center justify-center">
              <X size={18} />
            </button>
          </div>
        )}

        {showBgPicker && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {BACKGROUNDS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { setBgColor(color); setShowBgPicker(false); }}
                className={cn('w-8 h-8 rounded-full border-2 transition-transform hover:scale-110', bgColor === color ? 'border-[#213448]' : 'border-transparent')}
                style={{ backgroundColor: color }}
              />
            ))}
            <button type="button" onClick={() => { setBgColor(null); setShowBgPicker(false); }} className="w-8 h-8 rounded-full border-2 border-[#C8D8DF] flex items-center justify-center text-[#547792]">
              <X size={16} />
            </button>
          </div>
        )}

        {showFeelingPicker && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {FEELINGS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => { setFeeling(f); setShowFeelingPicker(false); }}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1', feeling?.label === f.label ? 'bg-[#547792] text-[#FDFAF5]' : 'bg-[#EAE0CF] text-[#547792] hover:bg-[#D4E8EE]')}
                >
                  <Icon size={16} weight="fill" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {showAudiencePicker && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {AUDIENCE_OPTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => { setAudience(a.value); setShowAudiencePicker(false); }}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1', audience === a.value ? 'bg-[#547792] text-[#FDFAF5]' : 'bg-[#EAE0CF] text-[#547792] hover:bg-[#D4E8EE]')}
                >
                  <Icon size={16} />
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {showSchedule && (
          <div className="mt-3 p-3 bg-[#EAE0CF]/40 rounded-xl flex gap-2 items-center">
            <Clock size={20} className="text-[#547792]" />
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="bg-transparent text-sm text-black focus:outline-none" />
            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="bg-transparent text-sm text-black focus:outline-none" />
            <button type="button" onClick={() => setShowSchedule(false)} className="ml-auto text-[#547792]">
              <X size={16} />
            </button>
          </div>
        )}

        {showPollCreator && (
          <div className="mt-3 p-3 bg-[#EAE0CF]/40 rounded-xl space-y-3">
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="ما هو سؤالك؟"
              className="w-full bg-transparent text-sm text-black placeholder:text-[#BFB9AD] focus:outline-none border-b border-[#C8D8DF] pb-2"
            />
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updatePollOption(i, e.target.value)}
                    placeholder={`خيار ${i + 1}`}
                    className="flex-1 bg-[#FDFAF5] rounded-lg px-3 py-2 text-sm text-black placeholder:text-[#BFB9AD] focus:outline-none focus:ring-2 focus:ring-[#547792]/20"
                  />
                  {pollOptions.length > 2 && (
                    <button type="button" onClick={() => removePollOption(i)} className="text-[#B05252]">
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addPollOption} className="text-sm text-[#547792] hover:text-[#213448] flex items-center gap-1">
              <Plus size={16} /> إضافة خيار
            </button>
            <button type="button" onClick={() => { setShowPollCreator(false); setPollQuestion(''); setPollOptions(['', '']); }} className="ml-auto text-[#547792] text-sm">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#C8D8DF]/40">
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setShowBgPicker(!showBgPicker)} className="p-2 rounded-lg text-[#547792] hover:bg-[#EAE0CF]/50" title="لون الخلفية">
              <Palette size={20} />
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="p-2 rounded-lg text-[#547792] hover:bg-[#EAE0CF]/50" title="صورة/فيديو">
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              <Image size={20} />
            </button>
            <button type="button" onClick={() => setShowFeelingPicker(!showFeelingPicker)} className="p-2 rounded-lg text-[#547792] hover:bg-[#EAE0CF]/50" title="شعور">
              <Smiley size={20} />
            </button>
            <button type="button" onClick={() => setLocation(prev => prev ? '' : 'موقع')} className={cn('p-2 rounded-lg hover:bg-[#EAE0CF]/50', location ? 'bg-[#D4E8EE] text-[#213448]' : 'text-[#547792]')} title="موقع">
              <MapPin size={20} />
            </button>
            <button type="button" onClick={() => setShowAudiencePicker(!showAudiencePicker)} className={cn('p-2 rounded-lg hover:bg-[#EAE0CF]/50', showAudiencePicker ? 'bg-[#D4E8EE]' : 'text-[#547792]')} title="الجمهور">
              <Users size={20} />
            </button>
            <button type="button" onClick={() => setShowSchedule(!showSchedule)} className={cn('p-2 rounded-lg hover:bg-[#EAE0CF]/50', showSchedule ? 'bg-[#D4E8EE] text-[#213448]' : 'text-[#547792]')} title="جدولة">
              <Clock size={20} />
            </button>
            <button type="button" onClick={() => setShowPollCreator(!showPollCreator)} className={cn('p-2 rounded-lg hover:bg-[#EAE0CF]/50', showPollCreator ? 'bg-[#D4E8EE] text-[#213448]' : 'text-[#547792]')} title="استطلاع">
              <ChartBar size={20} />
            </button>
          </div>
          <button
            type="submit"
            disabled={(!content.trim() && !mediaFile) || createPost.isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#FDFAF5] hover:shadow-md disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(to right, #213448, #547792)' }}
          >
            {createPost.isPending ? 'جاري النشر...' : scheduleDate ? 'جدولة' : 'نشر'}
          </button>
        </div>
      </form>
    </div>
  );
}