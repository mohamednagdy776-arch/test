'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { HeartStraight, Eye, PaperPlaneTilt } from '@phosphor-icons/react';
import { interestsApi } from '@/features/interests/api';
import { resolveMediaUrl } from '@/lib/media';

type Tab = 'received' | 'sent' | 'views';

interface PersonRow { id: string; status?: string; viewedAt?: string; user: { id: string; username?: string; fullName?: string; avatarUrl?: string } | null }

function PersonCard({ row }: { row: PersonRow }) {
  const u = row.user;
  const name = u?.fullName || u?.username || 'مستخدم';
  const avatar = u?.avatarUrl ? resolveMediaUrl(u.avatarUrl) : null;
  return (
    <Link
      href={u?.username ? `/${u.username}` : `/profile/${u?.id}`}
      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover shrink-0" />
      ) : (
        <div className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center text-lg font-bold text-[var(--primary-foreground)]"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)] truncate">{name}</p>
        {row.status === 'mutual' && (
          <span className="text-xs font-semibold text-[var(--accent)]">اهتمام متبادل 🎉</span>
        )}
      </div>
    </Link>
  );
}

export default function InterestsPage() {
  const [tab, setTab] = useState<Tab>('received');

  const received = useQuery({ queryKey: ['interests', 'received'], queryFn: interestsApi.received });
  const sent = useQuery({ queryKey: ['interests', 'sent'], queryFn: interestsApi.sent });
  const views = useQuery({ queryKey: ['profile-views'], queryFn: () => interestsApi.profileViews() });

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'received', label: 'المهتمون بك', icon: HeartStraight },
    { id: 'sent', label: 'اهتماماتك', icon: PaperPlaneTilt },
    { id: 'views', label: 'من شاهد ملفك', icon: Eye },
  ];

  const active = tab === 'received' ? received : tab === 'sent' ? sent : views;
  const rows: PersonRow[] = (active.data?.data ?? []) as PersonRow[];

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">الاهتمامات</h1>

      {/* flex-1 divided every tab into equal-width slots regardless of label
          length, so longer labels (e.g. "كل السمات") got clipped instead of
          just taking the width they need (#171) -- min-w-fit + overflow-x-auto
          matches the pattern already used in ProfileTabs. */}
      <div className="flex gap-2 mb-5 overflow-x-auto whitespace-nowrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 min-w-fit rounded-xl px-3 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={on
                ? { background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border))' }
                : { background: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
            >
              <Icon size={16} weight={on ? 'fill' : 'regular'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {active.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-2xl bg-[var(--muted)] animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
          <p className="text-3xl mb-2">💚</p>
          <p className="font-semibold text-[var(--foreground)]">لا يوجد شيء هنا بعد</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tab === 'views' ? 'لم يشاهد أحد ملفك بعد' : 'أرسل اهتمامك لمن يعجبك من خلال زر "أرسل السلام" في ملفهم'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => <PersonCard key={r.id} row={r} />)}
        </div>
      )}
    </div>
  );
}
