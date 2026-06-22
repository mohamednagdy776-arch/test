'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ShieldCheck, Plus, Check, X, Trash } from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/PageHeader';

type RelStatus = 'pending' | 'active' | 'revoked';

interface Relationship {
  id: string;
  guardianUserId: string;
  wardUserId: string;
  relationshipType: string;
  status: RelStatus;
  acceptedAt?: string;
  createdAt?: string;
  permissions?: Record<string, boolean>;
}

const TYPE_LABELS: Record<string, string> = {
  father: 'أب',
  mother: 'أم',
  brother: 'أخ',
  wali: 'ولي',
};

function StatusBadge({ status }: { status: RelStatus }) {
  const map: Record<RelStatus, [string, string]> = {
    pending: ['في الانتظار', 'bg-[var(--accent)]/15 text-[var(--accent)]'],
    active: ['نشط', 'bg-[var(--muted)] text-[var(--primary)]'],
    revoked: ['ملغي', 'bg-[var(--destructive)]/15 text-[var(--destructive)]'],
  };
  const [label, cls] = map[status] ?? ['غير معروف', 'bg-[var(--muted)] text-[var(--foreground)]'];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

function RelCard({ rel, onRevoke }: { rel: Relationship; onRevoke: (id: string) => void }) {
  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/50 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-2xl shrink-0">
        {rel.relationshipType === 'father' ? '👨' : rel.relationshipType === 'mother' ? '👩' : rel.relationshipType === 'brother' ? '🧑' : '🛡️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--foreground)] text-sm">
          {TYPE_LABELS[rel.relationshipType] ?? rel.relationshipType}
        </p>
        <p className="text-xs text-[var(--primary)]/60 mt-0.5 truncate">المعرف: {rel.guardianUserId}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={rel.status} />
        {rel.status !== 'revoked' && (
          <button
            onClick={() => onRevoke(rel.id)}
            className="text-xs text-[var(--destructive)] hover:text-[var(--destructive)] flex items-center gap-1 transition-colors"
          >
            <Trash size={12} /> إلغاء
          </button>
        )}
      </div>
    </div>
  );
}

function InviteGuardianModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [guardianUserId, setGuardianUserId] = useState('');
  const [type, setType] = useState('father');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (body: { guardianUserId: string; type: string }) =>
      apiClient.post('/family/invite-guardian', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-guardians'] });
      onClose();
    },
    onError: (e: any) => setError(e.response?.data?.message ?? 'حدث خطأ'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--foreground)]">دعوة ولي أمر</h2>
          <button onClick={onClose} className="text-[var(--primary)] hover:text-[var(--primary)]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">معرف ولي الأمر</label>
            <input
              type="text"
              value={guardianUserId}
              onChange={(e) => setGuardianUserId(e.target.value)}
              placeholder="أدخل UUID الخاص بولي الأمر"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">نوع العلاقة</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}

          <button
            onClick={() => mutation.mutate({ guardianUserId, type })}
            disabled={!guardianUserId.trim() || mutation.isPending}
            className="w-full rounded-2xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}
          >
            {mutation.isPending ? 'جار الإرسال...' : 'إرسال الدعوة'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-guardians'],
    queryFn: () => apiClient.get('/family/my-guardians').then((r) => r.data),
    staleTime: 60_000,
  });

  const relationships: Relationship[] = data?.data ?? data?.relationships ?? data ?? [];

  const revoke = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/family/${id}/revoke`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-guardians'] }),
  });

  const active = relationships.filter((r) => r.status === 'active');
  const pending = relationships.filter((r) => r.status === 'pending');
  const revoked = relationships.filter((r) => r.status === 'revoked');

  return (
    <div>
      {showInvite && <InviteGuardianModal onClose={() => setShowInvite(false)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          icon={ShieldCheck}
          eyebrow="وضع العائلة"
          title="العائلة"
          subtitle="إدارة أولياء الأمور والصلاحيات"
          action={
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Plus size={15} weight="bold" /> دعوة ولي أمر
            </button>
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/50 p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : relationships.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheck size={64} className="text-[var(--border)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">لا توجد علاقات عائلية</h2>
            <p className="text-[var(--primary)]/70 text-sm mb-6">ادعُ ولي أمر للإشراف على حسابك</p>
            <button
              onClick={() => setShowInvite(true)}
              className="rounded-2xl px-6 py-3 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}
            >
              دعوة ولي أمر الآن
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-[var(--primary)] mb-3 flex items-center gap-2">
                  <Check size={14} weight="bold" /> أولياء الأمور النشطون ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((r) => <RelCard key={r.id} rel={r} onRevoke={(id) => revoke.mutate(id)} />)}
                </div>
              </section>
            )}

            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-[var(--accent)] mb-3">⏳ دعوات في الانتظار ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map((r) => <RelCard key={r.id} rel={r} onRevoke={(id) => revoke.mutate(id)} />)}
                </div>
              </section>
            )}

            {revoked.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-[var(--muted-foreground)] mb-3">سجل العلاقات الملغاة ({revoked.length})</h2>
                <div className="space-y-3 opacity-60">
                  {revoked.map((r) => <RelCard key={r.id} rel={r} onRevoke={() => {}} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
