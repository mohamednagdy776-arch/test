'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SealCheck, IdentificationCard, UserFocus } from '@phosphor-icons/react';
import { verificationApi } from '@/features/verification/api';
import { useToast } from '@/components/ui/Toast';

function FilePick({ label, icon: Icon, file, onPick }: { label: string; icon: any; file: File | null; onPick: (f: File) => void }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-6 cursor-pointer hover:border-[var(--ring)] transition-colors text-center">
      <Icon size={32} className="text-[var(--muted-foreground)]" />
      <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <span className="text-xs text-[var(--muted-foreground)]">{file ? file.name : 'اضغط للاختيار'}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }}
      />
    </label>
  );
}

const STATUS_UI: Record<string, { label: string; color: string; desc: string }> = {
  approved: { label: 'موثّقة', color: 'var(--primary)', desc: 'تم التحقق من هويتك. تظهر شارة "موثّق الهوية" على ملفك.' },
  pending: { label: 'قيد المراجعة', color: 'var(--accent)', desc: 'طلبك قيد المراجعة من فريقنا. سنخطرك بالنتيجة قريباً.' },
  rejected: { label: 'مرفوضة', color: 'var(--destructive)', desc: 'لم يُقبل الطلب. يمكنك إعادة الإرسال بصور أوضح.' },
};

export default function VerificationPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['identity-verification'], queryFn: verificationApi.status });
  const status: string = data?.data?.status ?? 'unverified';
  const rejectionReason: string | null = data?.data?.rejectionReason ?? null;

  const submit = useMutation({
    mutationFn: () => verificationApi.submit(selfie!, idDoc!),
    onSuccess: (res: any) => {
      showToast(res?.data?.message || 'تم استلام طلب التوثيق', 'success');
      setSelfie(null); setIdDoc(null);
      qc.invalidateQueries({ queryKey: ['identity-verification'] });
    },
    onError: (e: any) => showToast(e?.response?.data?.message || 'تعذّر إرسال الطلب', 'error'),
  });

  const ui = STATUS_UI[status];
  const canSubmit = status === 'unverified' || status === 'rejected';

  return (
    <div className="max-w-xl mx-auto pb-24 lg:pb-8">
      <div className="flex items-center gap-2 mb-1">
        <SealCheck size={24} weight="fill" className="text-[var(--accent)]" />
        <h1 className="text-2xl font-bold text-[var(--foreground)]">توثيق الهوية</h1>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] mb-5">
        وثّق هويتك بصورة شخصية وصورة لإثبات هوية رسمي لتحصل على شارة "موثّق الهوية" وتزيد ثقة الآخرين بك.
      </p>

      {isLoading ? (
        <div className="h-24 rounded-2xl bg-[var(--muted)] animate-pulse" />
      ) : (
        <>
          {ui && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 mb-5">
              <p className="text-sm">
                الحالة: <span className="font-bold" style={{ color: ui.color }}>{ui.label}</span>
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{ui.desc}</p>
              {status === 'rejected' && rejectionReason && (
                <p className="text-xs text-[var(--destructive)] mt-2">السبب: {rejectionReason}</p>
              )}
            </div>
          )}

          {canSubmit && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FilePick label="صورة شخصية (سيلفي)" icon={UserFocus} file={selfie} onPick={setSelfie} />
                <FilePick label="إثبات هوية رسمي" icon={IdentificationCard} file={idDoc} onPick={setIdDoc} />
              </div>
              <button
                onClick={() => submit.mutate()}
                disabled={!selfie || !idDoc || submit.isPending}
                className="w-full rounded-xl py-3 text-sm font-bold text-[#0A3D2B] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #D4A853 100%)' }}
              >
                {submit.isPending ? 'جارٍ الإرسال...' : 'إرسال للتوثيق'}
              </button>
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                تُستخدم مستنداتك للتحقق فقط، ولا تظهر للمستخدمين الآخرين.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
