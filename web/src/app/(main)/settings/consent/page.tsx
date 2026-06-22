'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Check, X, Clock, LockSimple } from '@phosphor-icons/react';

type ConsentStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

interface ConsentRequest {
  id: string;
  requesterUserId: string;
  targetUserId: string;
  consentType: 'medical_share' | 'genetic_share';
  status: ConsentStatus;
  requestedAt?: string;
  respondedAt?: string;
  expiresAt?: string;
}

const TYPE_LABELS = {
  medical_share: 'مشاركة البيانات الطبية',
  genetic_share: 'مشاركة البيانات الجينية',
};

const STATUS_STYLES: Record<ConsentStatus, [string, string]> = {
  pending: ['⏳ في الانتظار', 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30'],
  accepted: ['✓ مقبول', 'bg-[var(--muted)] text-[var(--primary)] border-[var(--border)]'],
  declined: ['✗ مرفوض', 'bg-[var(--destructive)]/15 text-[var(--destructive)] border-[var(--destructive)]/30'],
  expired: ['منتهي الصلاحية', 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'],
  revoked: ['ملغي', 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'],
};

function ConsentCard({
  req,
  isIncoming,
  onAccept,
  onDecline,
  onRevoke,
}: {
  req: ConsentRequest;
  isIncoming: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onRevoke?: (id: string) => void;
}) {
  const [statusLabel, statusClass] = STATUS_STYLES[req.status] ?? ['غير معروف', 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'];

  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
            <LockSimple size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)] text-sm">
              {TYPE_LABELS[req.consentType] ?? req.consentType}
            </p>
            <p className="text-xs text-[var(--primary)]/60 mt-0.5">
              {isIncoming ? `من: ${req.requesterUserId.slice(0, 8)}...` : `إلى: ${req.targetUserId.slice(0, 8)}...`}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {req.expiresAt && (
        <p className="text-xs text-[var(--primary)]/50 flex items-center gap-1">
          <Clock size={11} /> ينتهي: {new Date(req.expiresAt).toLocaleDateString('ar-SA')}
        </p>
      )}

      {req.status === 'pending' && isIncoming && onAccept && onDecline && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAccept(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}
          >
            <Check size={13} weight="bold" /> قبول
          </button>
          <button
            onClick={() => onDecline(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-[var(--destructive)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/15 transition-colors"
          >
            <X size={13} weight="bold" /> رفض
          </button>
        </div>
      )}

      {req.status === 'accepted' && !isIncoming && onRevoke && (
        <button
          onClick={() => onRevoke(req.id)}
          className="text-xs text-[var(--destructive)] hover:text-[var(--destructive)] transition-colors flex items-center gap-1"
        >
          <X size={12} /> سحب الموافقة
        </button>
      )}
    </div>
  );
}

export default function ConsentManagementPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');

  const { data, isLoading } = useQuery({
    queryKey: ['my-consents'],
    queryFn: () => apiClient.get('/consent/my').then((r) => r.data),
    staleTime: 30_000,
  });

  const consentData = data?.data ?? data ?? {};
  const incoming: ConsentRequest[] = consentData?.incoming ?? consentData?.received ?? [];
  const outgoing: ConsentRequest[] = consentData?.outgoing ?? consentData?.sent ?? [];

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      apiClient.patch(`/consent/${id}/respond`, { action }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-consents'] }),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/consent/${id}/revoke`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-consents'] }),
  });

  const displayed = tab === 'incoming' ? incoming : outgoing;

  const pendingIncoming = incoming.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
          >
            <ArrowLeft size={18} className="text-[var(--primary)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">إدارة الموافقات</h1>
            <p className="text-[var(--primary)]/70 text-sm mt-0.5">طلبات مشاركة البيانات الطبية والجينية</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-[var(--card)]/60 p-1 rounded-2xl border border-[var(--border)]/50">
          <button
            onClick={() => setTab('incoming')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'incoming'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--primary)] hover:bg-[var(--muted)]'
            }`}
          >
            واردة
            {pendingIncoming > 0 && (
              <span className="mr-1.5 bg-[var(--accent)] text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingIncoming}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('outgoing')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'outgoing'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--primary)] hover:bg-[var(--muted)]'
            }`}
          >
            صادرة
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/50 h-24 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <LockSimple size={56} className="text-[var(--border)] mx-auto mb-4" />
            <p className="text-[var(--primary)] font-medium">
              {tab === 'incoming' ? 'لا توجد طلبات واردة' : 'لم ترسل أي طلبات بعد'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((req) => (
              <ConsentCard
                key={req.id}
                req={req}
                isIncoming={tab === 'incoming'}
                onAccept={(id) => respond.mutate({ id, action: 'accept' })}
                onDecline={(id) => respond.mutate({ id, action: 'decline' })}
                onRevoke={(id) => revoke.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
