'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Check, X, Clock, ShieldLock } from '@phosphor-icons/react';

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
  pending: ['⏳ في الانتظار', 'bg-amber-100 text-amber-700 border-amber-200'],
  accepted: ['✓ مقبول', 'bg-emerald-100 text-emerald-700 border-emerald-200'],
  declined: ['✗ مرفوض', 'bg-red-100 text-red-700 border-red-200'],
  expired: ['منتهي الصلاحية', 'bg-gray-100 text-gray-600 border-gray-200'],
  revoked: ['ملغي', 'bg-gray-100 text-gray-600 border-gray-200'],
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
  const [statusLabel, statusClass] = STATUS_STYLES[req.status] ?? ['غير معروف', 'bg-gray-100 text-gray-600 border-gray-200'];

  return (
    <div className="rounded-2xl bg-white/80 border border-emerald-200/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ShieldLock size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900 text-sm">
              {TYPE_LABELS[req.consentType] ?? req.consentType}
            </p>
            <p className="text-xs text-emerald-700/60 mt-0.5">
              {isIncoming ? `من: ${req.requesterUserId.slice(0, 8)}...` : `إلى: ${req.targetUserId.slice(0, 8)}...`}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {req.expiresAt && (
        <p className="text-xs text-emerald-700/50 flex items-center gap-1">
          <Clock size={11} /> ينتهي: {new Date(req.expiresAt).toLocaleDateString('ar-SA')}
        </p>
      )}

      {req.status === 'pending' && isIncoming && onAccept && onDecline && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAccept(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            <Check size={13} weight="bold" /> قبول
          </button>
          <button
            onClick={() => onDecline(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <X size={13} weight="bold" /> رفض
          </button>
        </div>
      )}

      {req.status === 'accepted' && !isIncoming && onRevoke && (
        <button
          onClick={() => onRevoke(req.id)}
          className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/80 border border-emerald-200 flex items-center justify-center hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft size={18} className="text-emerald-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">إدارة الموافقات</h1>
            <p className="text-emerald-700/70 text-sm mt-0.5">طلبات مشاركة البيانات الطبية والجينية</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white/60 p-1 rounded-2xl border border-emerald-200/50">
          <button
            onClick={() => setTab('incoming')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'incoming'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            واردة
            {pendingIncoming > 0 && (
              <span className="mr-1.5 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingIncoming}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('outgoing')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'outgoing'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            صادرة
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/80 border border-emerald-200/50 h-24 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <ShieldLock size={56} className="text-emerald-200 mx-auto mb-4" />
            <p className="text-emerald-700 font-medium">
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
