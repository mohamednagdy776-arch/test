'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { profileApi } from '../api';

interface Props {
  userId: string;
  userName?: string;
  open: boolean;
  onClose: () => void;
}

// [Body_Sadek] #751 — report a user for trust & safety review.
export function ReportUserModal({ userId, userName, open, onClose }: Props) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const { data: reasonsData } = useQuery({
    queryKey: ['report-reasons'],
    queryFn: profileApi.getReportReasons,
    enabled: open,
    staleTime: 1000 * 60 * 60,
  });
  const reasons: { id: string; label: string }[] = reasonsData?.data ?? [];

  const submit = useMutation({
    mutationFn: () => profileApi.reportUser(userId, reason, details.trim() || undefined),
    onSuccess: (res: any) => {
      showToast(res?.message || 'تم استلام بلاغك، وسيقوم فريقنا بمراجعته', 'success');
      setReason(''); setDetails('');
      onClose();
    },
    onError: () => showToast('تعذّر إرسال البلاغ، حاول مرة أخرى', 'error'),
  });

  return (
    <Modal open={open} onClose={onClose} title={`إبلاغ عن ${userName || 'المستخدم'}`}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          اختر سبب البلاغ. تُراجَع البلاغات بسرّية من قِبل فريق الأمان.
        </p>

        <div className="space-y-2">
          {reasons.map((r) => (
            <label
              key={r.id}
              className="flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors"
              style={{
                borderColor: reason === r.id ? 'var(--ring)' : 'var(--border)',
                background: reason === r.id ? 'color-mix(in srgb, var(--accent) 10%, var(--card))' : 'var(--card)',
              }}
            >
              <input
                type="radio"
                name="report-reason"
                value={r.id}
                checked={reason === r.id}
                onChange={() => setReason(r.id)}
                className="accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--foreground)]">{r.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="report-details" className="block text-xs font-semibold text-[var(--primary)]">
            تفاصيل إضافية (اختياري)
          </label>
          <textarea
            id="report-details"
            dir="auto"
            rows={3}
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="صف ما حدث لمساعدتنا في المراجعة"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 transition-all"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => submit.mutate()}
            disabled={!reason || submit.isPending}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--destructive-foreground)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: 'var(--destructive)' }}
          >
            {submit.isPending ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
