'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/features/auth/api';
import { profileApi } from '@/features/profile/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

interface Session {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  isActive: boolean;
  isCurrent?: boolean;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
const [sessionsRes, profileRes] = await Promise.all([
        authApi.getSessions(),
        profileApi.getMyProfile().catch(() => null),
      ]);
      setSessions(sessionsRes.data || []);
      setTwoFactorEnabled(profileRes?.data?.twoFactorEnabled || false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await authApi.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إلغاء الجلسة');
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('هل أنت متأكد من إلغاء جميع الجلسات الأخرى؟')) return;
    setRevoking('all');
    try {
      await authApi.revokeAllSessions();
      setSessions(prev => prev.filter(s => s.isCurrent));
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إلغاء الجلسات');
    } finally {
      setRevoking(null);
    }
  };

  const handleSetup2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await authApi.setup2FA();
      setSetupData({ qrCode: res.data.qrCode || '', secret: res.data.secret || '' });
      setShow2FASetup(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إعداد التحقق');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verifyCode.trim()) return;
    setTwoFactorLoading(true);
    try {
      await authApi.verify2FA(verifyCode);
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setVerifyCode('');
      setSetupData(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'رمز التحقق غير صحيح');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableCode.trim()) return;
    setTwoFactorLoading(true);
    try {
      await authApi.disable2FA(disableCode);
      setTwoFactorEnabled(false);
      setShowDisable2FA(false);
      setDisableCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'رمز التحقق غير صحيح');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBrowserIcon = (browser: string) => {
    if (!browser) return '💻';
    const b = browser.toLowerCase();
    if (b.includes('chrome')) return '🌐';
    if (b.includes('firefox')) return '🦊';
    if (b.includes('safari')) return '🧭';
    if (b.includes('edge')) return '🟢';
    return '💻';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#213448]">الأمان</h1>
        <p className="text-sm text-[#547792] mt-1">إدارة جلساتك وتوثيق حسابك</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#B05252]/10 border border-[#B05252] text-[#B05252] text-sm">
          {error}
        </div>
      )}

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>📱</span> إدارة الجلسات
          </CardTitle>
          <CardDescription>الجلسات النشطة على حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-center text-[#547792] py-4">لا توجد جلسات</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 hover:border-[#547792]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getBrowserIcon(session.browser)}</div>
                    <div>
                      <p className="font-semibold text-[#213448]">
                        {session.deviceName || 'جهاز غير معروف'}
                        {session.isCurrent && (
                          <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-[#4A8C6F]/15 text-[#4A8C6F]">
                            الحالي
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-[#547792]">{session.browser || 'متصفح غير معروف'} · {session.ipAddress || '-'}</p>
                      <p className="text-xs text-[#BFB9AD]">آخر نشاط: {formatDate(session.lastActive)}</p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={revoking === session.id}
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-[#B05252] hover:bg-[#B05252]/10"
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          {sessions.length > 1 && (
            <div className="mt-4 pt-4 border-t border-[#C8D8DF]/40">
              <Button
                variant="outline"
                size="sm"
                loading={revoking === 'all'}
                onClick={handleRevokeAllSessions}
                className="text-[#B05252] border-[#B05252]/30 hover:bg-[#B05252]/10 hover:border-[#B05252]"
              >
                إلغاء جميع الجلسات الأخرى
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🔐</span> التحقق بخطوتين
          </CardTitle>
          <CardDescription>أضف طبقة إضافية من الأمان لحسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${twoFactorEnabled ? 'bg-[#4A8C6F]/15' : 'bg-[#D4E8EE]'}`}>
                {twoFactorEnabled ? '✓' : '🔒'}
              </div>
              <div>
                <p className="font-semibold text-[#213448]">التحقق بخطوتين</p>
                <p className="text-sm text-[#547792]">
                  {twoFactorEnabled ? 'مفعّل · حسابك محمي' : 'غير مفعّل'}
                </p>
              </div>
            </div>
            {twoFactorEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisable2FA(true)}
                className="text-[#B05252] border-[#B05252]/30 hover:bg-[#B05252]/10"
              >
                إلغاء التفعيل
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={twoFactorLoading}
                onClick={handleSetup2FA}
              >
                تفعيل
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal open={show2FASetup} onClose={() => setShow2FASetup(false)} title="تفعيل التحقق بخطوتين">
        <div className="space-y-4">
          {setupData?.qrCode && (
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <img src={setupData.qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
          {setupData?.secret && (
            <div className="text-center">
              <p className="text-sm text-[#547792] mb-1">أو أدخل هذا الرمز يدوياً:</p>
              <p className="font-mono text-lg font-bold text-[#213448] bg-[#D4E8EE] px-4 py-2 rounded-lg inline-block">
                {setupData.secret}
              </p>
            </div>
          )}
          <Input
            label="رمز التحقق"
            placeholder="أدخل الرمز من التطبيق"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            maxLength={6}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShow2FASetup(false); setVerifyCode(''); }} className="flex-1">
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleVerify2FA} loading={twoFactorLoading} disabled={!verifyCode.trim()} className="flex-1">
              تأكيد
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showDisable2FA} onClose={() => setShowDisable2FA(false)} title="إلغاء التحقق بخطوتين">
        <div className="space-y-4">
          <p className="text-sm text-[#547792]">
            لإلغاء التحقق بخطوتين، أدخل رمز التحقق من التطبيق
          </p>
          <Input
            label="رمز التحقق"
            placeholder="أدخل الرمز من التطبيق"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            maxLength={6}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShowDisable2FA(false); setDisableCode(''); }} className="flex-1">
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDisable2FA} loading={twoFactorLoading} disabled={!disableCode.trim()} className="flex-1">
              إلغاء التفعيل
            </Button>
          </div>
        </div>
      </Modal>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🚪</span> تسجيل الخروج
          </CardTitle>
          <CardDescription>تسجيل الخروج من جميع الأجهزة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
            <div className="flex-1">
              <h3 className="font-semibold text-[#213448]">تسجيل الخروج من كل الجلسات</h3>
              <p className="text-sm text-[#547792] mt-0.5">سيتم تسجيل الخروج من جميع الأجهزة باستثناء هذا الجهاز</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAllSessions}
              loading={revoking === 'all'}
              className="text-[#B05252] border-[#B05252]/30 hover:bg-[#B05252]/10 hover:border-[#B05252]"
            >
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>⚠️</span> danger zone
          </CardTitle>
          <CardDescription>إجراءات خطرة على حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between p-4 rounded-xl bg-[#B05252]/5 border border-[#B05252]/30">
            <div className="flex-1">
              <h3 className="font-semibold text-[#B05252]">حذف الحساب</h3>
              <p className="text-sm text-[#547792] mt-0.5">طلب حذف حسابك بشكل نهائي</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              حذف الحساب
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="حذف الحساب">
        <div className="space-y-4">
          <p className="text-sm text-[#547792]">
            هل أنت متأكد من طلب حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بياناتك نهائياً.
          </p>
          <div className="p-3 rounded-xl bg-[#B05252]/10 text-[#B05252] text-sm">
            ⚠️ سيتم حذف جميع منشوراتك، صورك، رسائلك، وصدقائك نهائياً
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="flex-1">
              إلغاء
            </Button>
            <Button variant="danger" onClick={() => alert('تم إرسال طلب حذف الحساب')} className="flex-1">
              تأكيد الحذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}