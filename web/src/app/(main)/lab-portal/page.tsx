'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { labsApi, type Lab, type ReferralCode } from '@/features/labs/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { TestTube } from '@phosphor-icons/react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    used: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
    expired: 'bg-[var(--destructive)]/15 text-[var(--destructive)]',
    pending: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
      {status}
    </span>
  );
}

function codeStatus(code: ReferralCode): 'used' | 'expired' | 'active' {
  if (code.usedAt) return 'used';
  if (new Date(code.expiresAt) < new Date()) return 'expired';
  return 'active';
}

function QRModal({ code, onClose }: { code: ReferralCode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="rounded-3xl p-8 w-full max-w-sm text-center shadow-xl"
        style={{ backgroundColor: 'var(--card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          اعرض هذا الكود للمختبر
        </h2>
        <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
          سيقوم المختبر بمسح الكود للتحقق من هويتك
        </p>
        <div className="flex justify-center mb-4 p-4 rounded-2xl bg-[var(--card)]">
          <QRCode value={code.code} size={200} />
        </div>
        <p
          className="font-mono text-sm font-bold tracking-widest mb-1 px-3 py-2 rounded-xl"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
        >
          {code.code}
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
          ينتهي {new Date(code.expiresAt).toLocaleDateString('ar-SA')}
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}

export default function LabPortalPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [referrals, setReferrals] = useState<ReferralCode[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeQR, setActiveQR] = useState<ReferralCode | null>(null);

  const fetchReferrals = useCallback(() => {
    setLoadingReferrals(true);
    labsApi
      .getMyReferrals()
      .then((data) => setReferrals(Array.isArray(data) ? data : (data as any)?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingReferrals(false));
  }, []);

  useEffect(() => {
    labsApi
      .getActiveLabs()
      .then((data) => setLabs(Array.isArray(data) ? data : (data as any)?.data ?? []))
      .catch(() => setError('فشل تحميل قائمة المختبرات'))
      .finally(() => setLoadingLabs(false));
    fetchReferrals();
  }, [fetchReferrals]);

  const handleGenerate = async (labId: string) => {
    setGenerating(labId);
    setError(null);
    try {
      const newCode = await labsApi.generateCode(labId);
      const code: ReferralCode = (newCode as any)?.data ?? newCode;
      fetchReferrals();
      setActiveQR(code);
    } catch {
      setError('فشل إنشاء كود الإحالة');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {activeQR && <QRModal code={activeQR} onClose={() => setActiveQR(null)} />}

      <PageHeader
        icon={TestTube}
        eyebrow="الصحة"
        title="بوابة المختبرات"
        subtitle="أنشئ كود إحالة لإجراء فحوصاتك في مختبر معتمد والحصول على شارة التحقق الصحي"
      />

      {error && (
        <div className="rounded-xl p-3 bg-[var(--destructive)]/10 text-[var(--destructive)] text-sm">{error}</div>
      )}

      {/* Available Labs */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          المختبرات المتاحة
        </h2>
        {loadingLabs ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
            ))}
          </div>
        ) : labs.length === 0 ? (
          <div className="rounded-2xl p-6 text-center text-sm" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}>
            لا توجد مختبرات نشطة حالياً
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="rounded-2xl p-4 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{lab.name}</p>
                  {lab.commercialRegistration && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      س.ت: {lab.commercialRegistration}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleGenerate(lab.id)}
                  disabled={generating === lab.id}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {generating === lab.id ? '...' : 'إنشاء كود QR'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Referral Codes */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          أكوادي
        </h2>
        {loadingReferrals ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="rounded-2xl p-6 text-center text-sm" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}>
            لم تقم بإنشاء أي كود بعد
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((ref) => {
              const status = codeStatus(ref);
              return (
                <div
                  key={ref.id}
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-sm font-bold tracking-widest px-3 py-1 rounded-xl"
                      style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                    >
                      {ref.code.slice(0, 8)}…
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>
                      <p>ينتهي {new Date(ref.expiresAt).toLocaleDateString('ar-SA')}</p>
                      {ref.usedAt && <p>استُخدم {new Date(ref.usedAt).toLocaleDateString('ar-SA')}</p>}
                    </div>
                    {status === 'active' && (
                      <button
                        onClick={() => setActiveQR(ref)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                      >
                        عرض QR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
