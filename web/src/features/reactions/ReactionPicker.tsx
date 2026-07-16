'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Shared across posts and videos (#151) -- was previously a PostCard-only
// local definition; videos only ever had a single boolean Like with no
// reaction-type picker at all.
export const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'إعجاب', activeBg: 'bg-[var(--muted)]', activeText: 'text-[var(--foreground)]' },
  { type: 'love', emoji: '❤️', label: 'حب', activeBg: 'bg-[#B05252]/15', activeText: 'text-[#B05252]' },
  { type: 'haha', emoji: '😂', label: 'ضحك', activeBg: 'bg-[#F9D71C]/20', activeText: 'text-[#F9D71C]' },
  { type: 'wow', emoji: '😮', label: 'مثير', activeBg: 'bg-[#F9A825]/20', activeText: 'text-[#F9A825]' },
  { type: 'sad', emoji: '😢', label: 'حزن', activeBg: 'bg-[#5C6BC0]/20', activeText: 'text-[#5C6BC0]' },
  { type: 'angry', emoji: '😠', label: 'غضب', activeBg: 'bg-[#B05252]/20', activeText: 'text-[#B05252]' },
];

// Rough footprint of the picker (6 emoji buttons + padding/gaps) used to keep
// it on-screen when the trigger sits near a viewport edge -- see the anchored
// branch below.
const PICKER_WIDTH_ESTIMATE = 300;

export function ReactionPicker({
  onSelect,
  onClose,
  anchorRef,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
  // Optional. When provided, the picker is rendered through a document.body
  // portal and positioned from the trigger button's OWN getBoundingClientRect(),
  // the same pattern PostCard's PostMenu uses for #241/#412. Without this, the
  // picker fell back to a plain `absolute bottom-full left-0` offset from the
  // nearest positioned ancestor -- fine for a lone button, but PostCard wraps
  // the reaction button together with a second "breakdown counts" button in a
  // single flex row, and in the app's default RTL layout that row's visual
  // order flips while `left-0` stays physical, so the picker opened hovering
  // over the WRONG button entirely (#388).
  anchorRef?: React.RefObject<HTMLElement | null>;
}) {
  const [coords, setCoords] = useState<{ bottom: number; left: number } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const maxLeft = window.innerWidth - PICKER_WIDTH_ESTIMATE - 8;
    const left = Math.max(8, Math.min(rect.left, maxLeft));
    setCoords({ bottom: window.innerHeight - rect.top + 8, left });
  }, [anchorRef]);

  // Self-contained outside-click handling for the anchored/portal mode. A
  // portal's DOM node lives outside its React parent's subtree, so a
  // click-outside check living in the *caller* (keyed off a ref around just
  // the visible button) would treat every click inside this portaled picker
  // as "outside" and close it before the emoji button's own onClick could
  // fire, silently swallowing the selection.
  useEffect(() => {
    if (!anchorRef) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (pickerRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, onClose]);

  const body = (
    <div className="flex gap-2">
      {REACTIONS.map((r) => (
        <button
          key={r.type}
          onClick={() => { onSelect(r.type); onClose(); }}
          className="text-2xl p-2 hover:bg-[var(--muted)]/50 rounded-full transition-transform hover:scale-125 hover:shadow-soft"
          title={r.label}
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );

  if (anchorRef) {
    if (!coords) return null;
    return createPortal(
      <div
        ref={pickerRef}
        className="fixed bg-[var(--card)] rounded-2xl shadow-glow-lg border border-[var(--border)]/60 p-3 animate-scale-in z-[60]"
        style={{ bottom: coords.bottom, left: coords.left }}
      >
        {body}
      </div>,
      document.body,
    );
  }

  return (
    <div ref={pickerRef} className="absolute bottom-full mb-2 left-0 bg-[var(--card)] rounded-2xl shadow-glow-lg border border-[var(--border)]/60 p-3 animate-scale-in z-20">
      {body}
    </div>
  );
}
