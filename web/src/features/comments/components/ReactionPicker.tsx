'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThumbsUp, Heart, Smiley, SmileyMeh, SmileySad, SmileyAngry } from '@phosphor-icons/react';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, label: 'إعجاب', activeBg: 'bg-[#D4E8EE]', activeText: 'text-[#213448]' },
  { type: 'love', icon: Heart, label: 'حب', activeBg: 'bg-[#B05252]/15', activeText: 'text-[#B05252]' },
  { type: 'haha', icon: Smiley, label: 'ضحك', activeBg: 'bg-[#F9D71C]/20', activeText: 'text-[#F9D71C]' },
  { type: 'wow', icon: SmileyMeh, label: 'مثير', activeBg: 'bg-[#F9A825]/20', activeText: 'text-[#F9A825]' },
  { type: 'sad', icon: SmileySad, label: 'حزن', activeBg: 'bg-[#5C6BC0]/20', activeText: 'text-[#5C6BC0]' },
  { type: 'angry', icon: SmileyAngry, label: 'غضب', activeBg: 'bg-[#B05252]/20', activeText: 'text-[#B05252]' },
];

interface ReactionPickerProps {
  onSelect: (type: string) => void;
  position?: 'top' | 'bottom';
}

export function ReactionPicker({ onSelect, position = 'bottom' }: ReactionPickerProps) {
  return (
    <div 
      className={cn(
        "absolute left-0 bg-[#FDFAF5] rounded-2xl shadow-lg border border-[#C8D8DF]/60 p-3 animate-scale-in z-20",
        position === 'top' ? "bottom-full mb-2" : "top-full mt-2"
      )}
    >
      <div className="flex gap-1">
        {REACTIONS.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.type}
              onClick={() => onSelect(r.type)}
              className="p-2 hover:bg-[#EAE0CF]/50 rounded-full transition-transform hover:scale-125"
              title={r.label}
            >
              <Icon size={24} weight="fill" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ReactionDisplayProps {
  reactions?: {
    type: string;
    count: number;
  }[];
  totalCount?: number;
  userReaction?: string;
  onClick?: () => void;
  onSelect?: (type: string) => void;
}

export function ReactionDisplay({ reactions = [], totalCount = 0, userReaction, onClick, onSelect }: ReactionDisplayProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (totalCount === 0) {
    return (
      <button onClick={onClick} className="text-sm text-[#547792] hover:underline flex items-center gap-1">
        <ThumbsUp size={16} weight="fill" />
        إعجاب
      </button>
    );
  }

  const mainReaction = reactions.find(r => r.type === userReaction) || reactions[0];
  const mainReactionIcon = REACTIONS.find(r => r.type === mainReaction?.type)?.icon || ThumbsUp;
  const MainIcon = mainReactionIcon;

  return (
    <div className="relative" ref={pickerRef}>
      <button 
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition-all",
          userReaction 
            ? REACTIONS.find(r => r.type === userReaction)?.activeBg + " " + REACTIONS.find(r => r.type === userReaction)?.activeText
            : "hover:bg-[#EAE0CF]/50 text-[#547792]"
        )}
      >
        <MainIcon size={16} weight="fill" />
        <span>{totalCount}</span>
      </button>
      
      {showPicker && onSelect && (
        <ReactionPicker onSelect={(type) => { onSelect(type); setShowPicker(false); }} />
      )}
    </div>
  );
}

export { REACTIONS };