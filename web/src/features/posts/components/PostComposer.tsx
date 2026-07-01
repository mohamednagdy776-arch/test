'use client';
import { useState, useEffect, useRef } from 'react';
import { useCreatePost, useCreatePostWithMedia, useUploadMedia } from '../hooks';
import { cn } from '@/lib/utils';
import { extractFirstUrl } from '@/lib/linkify';
import { useLinkPreview } from '@/lib/useLinkPreview';
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
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [dismissedUrls, setDismissedUrls] = useState<string[]>([]);

  const createPost = useCreatePost();
  const createPostWithMedia = useCreatePostWithMedia();
  const uploadMedia = useUploadMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  // Detect a pasted/typed link (debounced) to show a live preview card.
  useEffect(() => {
    const t = setTimeout(() => setDetectedUrl(extractFirstUrl(content)), 400);
    return () => clearTimeout(t);
  }, [content]);

  const activeUrl =
    detectedUrl && !dismissedUrls.includes(detectedUrl) && mediaFiles.length === 0 && !bgColor
      ? detectedUrl
      : null;
  const { data: linkPreview, isLoading: linkLoading } = useLinkPreview(activeUrl);
  const hasPreview = !!(linkPreview && (linkPreview.title || linkPreview.description || linkPreview.image));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0 && !pollQuestion.trim()) return;

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    let mediaUrls: string[] | undefined;
    if (mediaFiles.length > 0) {
      const results = await Promise.all(mediaFiles.map((f) => uploadMedia.mutateAsync(f)));
      const urls = results.map((r) => r.data?.url).filter(Boolean) as string[];
      mediaType = results[0]?.data?.type;
      mediaUrl = urls[0];
      if (urls.length > 1) mediaUrls = urls;
    }

    const scheduledAt = scheduleDate && scheduleTime 
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() 
      : undefined;

    let pollOpts: { text: string; votes: number }[] | undefined;
    if (pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      pollOpts = pollOptions.filter(o => o.trim()).map(o => ({ text: o, votes: 0 }));
    }

    // The poll question was previously dropped entirely, so an image+poll (or any
    // poll) submitted with an empty caption sent content:'' and the backend
    // rejected it with "Post content cannot be empty" — the post never published
    // (#20). Fall back to the poll question as the post body so it both passes
    // validation and is shown above the poll.
    const finalContent = content.trim() || (pollOpts ? pollQuestion.trim() : '');

    // Carry the previewed link through so the server persists it without a
    // refetch; if the author dismissed it, tell the server to skip enrichment.
    const linkFields = hasPreview && activeUrl
      ? {
          linkUrl: linkPreview!.url,
          linkTitle: linkPreview!.title,
          linkDescription: linkPreview!.description,
          linkImage: linkPreview!.image,
        }
      : detectedUrl && dismissedUrls.includes(detectedUrl)
        ? { noLinkPreview: true }
        : {};

    await createPost.mutateAsync({
      groupId: groupId || '',
      content: finalContent,
      mediaUrl,
      mediaType,
      mediaUrls,
      bgColor: bgColor || undefined,
      feeling: feeling?.label || undefined,
      location: location || undefined,
      audience: audience as any,
      scheduledAt,
      pollOptions: pollOpts,
      postType: pollOpts ? 'poll' : (hasPreview ? 'link' : undefined),
      ...linkFields,
    });
    
    resetForm();
    onSuccess?.();
  };

  const resetForm = () => {
    setContent('');
    setBgColor(null);
    setFeeling(null);
    setLocation('');
    setShowLocation(false);
    setAudience('friends');
    setMediaPreviews([]);
    setMediaFiles([]);
    setScheduleDate('');
    setScheduleTime('');
    setTaggedUsers([]);
    setPollQuestion('');
    setPollOptions(['', '']);
    setDetectedUrl(null);
    setDismissedUrls([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    // A video can't be part of an image gallery — if any video is picked, keep
    // only the first file. Otherwise allow up to 10 images.
    const hasVideo = files.some((f) => f.type.startsWith('video/'));
    const chosen = hasVideo ? files.slice(0, 1) : files.slice(0, 10);
    setMediaFiles(chosen);
    setMediaPreviews(chosen.map((f) => URL.createObjectURL(f)));
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
    <div className="rounded-2xl bg-[var(--card)] shadow-card border border-[var(--border)]/60 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-[var(--card)] font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>أ</div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="على ما يدور ذهنك؟"
              className={cn(