'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useFollowStatus, useFollowCounts, useToggleFollow, useFollowers, useFollowing } from '../hooks';

function FollowButton({ userId }: { userId: string }) {
  const { data } = useFollowStatus(userId);
  const isFollowing = !!data?.data?.following;
  const { follow, unfollow } = useToggleFollow(userId);
  const pending = follow.isPending || unfollow.isPending;
  return (
    <button
      onClick={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
      disabled={pending}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
          : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[var(--card)] hover:shadow-glow'
      }`}
    >
      {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
    </button>
  );
}

function FollowListModal({ userId, kind, onClose }: { userId: string; kind: 'followers' | 'following'; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const followers = useFollowers(kind === 'followers' ? userId : undefined, search);
  const following = useFollowing(kind === 'following' ? userId : undefined, search);
  const query = kind === 'followers' ? followers : following;
  const users: any[] = query.data?.data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-[var(--card)] p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[var(--foreground)]">{kind === 'followers' ? 'المتابِعون' : 'يتابِع'}</h3>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو اسم المستخدم..."
          className="w-full mb-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)]"
        />
        {query.isLoading ? (
          <p className="text-center text-sm text-[var(--muted-foreground)] py-6">جاري التحميل...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted-foreground)] py-6">لا يوجد أحد</p>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <Link
                key={u.id}
                href={u.username ? `/${u.username}` : `/profile/${u.id}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--muted)]/40 transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-sm font-bold text-[var(--foreground)]">
                  {(u.profile?.fullName || u.username || '؟').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{u.profile?.fullName || u.username || 'مستخدم'}</p>
                  {u.username && <p className="text-xs text-[var(--muted-foreground)] truncate">@{u.username}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function FollowSection({ userId, isSelf }: { userId: string; isSelf?: boolean }) {
  const { data: counts } = useFollowCounts(userId);
  const followers = counts?.data?.followers ?? 0;
  const following = counts?.data?.following ?? 0;
  const [modal, setModal] = useState<null | 'followers' | 'following'>(null);

  return (
    <div className="flex items-center gap-4 mt-2">
      {!isSelf && <FollowButton userId={userId} />}
      {/* Clicking a count opens the corresponding list (#418/#419). */}
      <button onClick={() => setModal('followers')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
        <span className="font-bold text-[var(--foreground)]">{followers}</span> متابِع
      </button>
      <button onClick={() => setModal('following')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
        <span className="font-bold text-[var(--foreground)]">{following}</span> يتابِع
      </button>
      {modal && <FollowListModal userId={userId} kind={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
