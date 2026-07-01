'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';
import { profileApi } from '@/features/profile/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import QRCode from 'react-qr-code';

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
  const [setupData, setSetupData] = useState<{ otpauthUrl: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdSuccess, setChangePwdSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsRes, profileRes] = await Promise.all([
        authApi.getSessions(),
        profileApi.getMyProfile().catch(() => null),
      ]);
      const sessionsData = sessionsRes.data || [];
      setSessions(sessionsData);
      setCurrentSession(sessionsData.find(s => s.isActive) || sessionsData[0] || null);
      setTwoFactorEnabled(profileRes?.data?.twoFactorEnabled || false);
    } catch (err: any) {
      const message = err.response?.data?.message || 'حدث خطأ';
      setError(message);
      setAlerts(prev => [...prev, { id: Date.now().toString(), type: 'error', message }]);
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

  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);

  const handleRevokeAllSessions = async () => {
    setShowRevokeAllModal(false);
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
      // Backend returns { secret, otpauthUrl } — render the QR client-side from
      // otpauthUrl (there is no server-side qrCode image) (#57).
      setSetupData({ otpauthUrl: res.data.otpauthUrl || '', secret: res.data.secret || '' });
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwdError('');
    setChangePwdSuccess(false);
    if (newPassword !== confirmPassword) {
      setChangePwdError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (newPassword.length < 8) {
      setChangePwdError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }
    // Enforce the backend complexity rule client-side too, so a weak password is
    // caught before the request instead of only being rejected server-side (#731).
    const strong = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)
      && /\d/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword);
    if (!strong) {
      setChangePwdError('كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص');
      return;
    }
    setChangePwdLoading(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      setChangePwdSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setChangePwdError(err?.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setChangePwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setAlerts(prev => [...prev, { id: Date.now().toString(), type: 'error', message: 'يرجى إدخال كلمة المرور للتأكيد' }]);
      return;
    }
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount({ password: deletePassword });
      await authApi.logout().catch(() => {});
      window.location.href = '/login';
    } catch (err: any) {
      setAlerts(prev => [...prev, { id: Date.now().toString(), type: 'error', message: err?.response?.data?.message || 'فشل حذف الحساب، حاول مرة أخرى' }]);
    } finally {
      setDeleteLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">الأمان</h1>
          <p className="text-[var(--primary)]/70 mt-2">إدارة جلساتك وتوثيق حسابك</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 text-[var(--destructive)] text-sm">
            {error}
          </div>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  alert.type === 'success'
                    ? 'bg-[var(--muted)] border-[var(--border)] text-[var(--primary)]'
                    : 'bg-[var(--destructive)]/10 border-[var(--destructive)]/30 text-[var(--destructive)]'
                }`}
              >
                <span className="text-sm">{alert.message}</span>
                <button
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-[var(--primary)]/50 hover:text-[var(--foreground)] transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>📱</span> إدارة الجلسات
            </CardTitle>
            <CardDescription>الجلسات النشطة على حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-center text-[var(--primary)]/70 py-4">لا توجد جلسات</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]/50 hover:border-[var(--border)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getBrowserIcon(session.browser)}</div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {session.deviceName || 'جهاز غير معروف'}
                          {session.isCurrent && (
                            <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--primary)]">
                              الحالي
                            </span>
                          )}
                        </p>
                        <p className="text-[var(--primary)]/70 text-sm">{session.browser || 'متصفح غير معروف'} · {session.ipAddress || '-'}</p>
                        <p className="text-xs text-[var(--primary)]/50">آخر نشاط: {formatDate(session.lastActive)}</p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={revoking === session.id}
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      >
                        إلغاء
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            {sessions.length > 1 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]/30">
                <Button
                  variant="outline"
                  size="sm"
                  loading={revoking === 'all'}
                  onClick={() => setShowRevokeAllModal(true)}
                  className="text-[var(--destructive)] border-[var(--destructive)]/40 hover:bg-[var(--destructive)]/10 hover:border-[var(--destructive)]/50"
                >
                  إلغاء جميع الجلسات الأخرى
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>🔐</span> التحقق بخطوتين
            </CardTitle>
            <CardDescription>أضف طبقة إضافية من الأمان</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]/50">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${twoFactorEnabled ? 'bg-[var(--muted)]' : 'bg-[var(--accent)]/15'}`}>
                  {twoFactorEnabled ? '✓' : '🔒'}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">التحقق بخطوتين</p>
                  <p className="text-[var(--primary)]/70 text-sm">
                    {twoFactorEnabled ? 'مفعّل · حسابك محمي' : 'غير مفعّل'}
                  </p>
                </div>
              </div>
              {twoFactorEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisable2FA(true)}
                  className="text-[var(--destructive)] border-[var(--destructive)]/40 hover:bg-[var(--destructive)]/10"
                >
                  إلغاء التفعيل
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  loading={twoFactorLoading}
                  onClick={handleSetup2FA}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
                >
                  تفعيل
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Modal open={show2FASetup} onClose={() => setShow2FASetup(false)} title="تفعيل التحقق بخطوتين">
          <div className="space-y-4">
            {setupData?.otpauthUrl && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-[var(--primary)]">امسح رمز QR بتطبيق المصادقة</p>
                {/* QR must sit on a solid white background with a quiet zone so
                    authenticator cameras can read it reliably. */}
                <div className="p-4 bg-white rounded-xl">
                  <QRCode value={setupData.otpauthUrl} size={192} />
                </div>
              </div>
            )}
            {setupData?.secret && (
              <div className="text-center">
                <p className="text-sm text-[var(--primary)] mb-1">أو أدخل هذا الرمز يدوياً:</p>
                <p className="font-mono text-lg font-bold text-[var(--foreground)] bg-[var(--muted)] px-4 py-2 rounded-lg inline-block">
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
              <Button variant="ghost" onClick={() => { setShow2FASetup(false); setVerifyCode(''); }} className="flex-1 text-[var(--primary)]">
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleVerify2FA} loading={twoFactorLoading} disabled={!verifyCode.trim()} className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                تأكيد
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={showDisable2FA} onClose={() => setShowDisable2FA(false)} title="إلغاء التحقق بخطوتين">
          <div className="space-y-4">
            <p className="text-sm text-[var(--primary)]">
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
              <Button variant="ghost" onClick={() => { setShowDisable2FA(false); setDisableCode(''); }} className="flex-1 text-[var(--primary)]">
                إلغاء
              </Button>
              <Button variant="danger" onClick={handleDisable2FA} loading={twoFactorLoading} disabled={!disableCode.trim()} className="flex-1">
                إلغاء التفعيل
              </Button>
            </div>
          </div>
        </Modal>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>🔑</span> تغيير كلمة المرور
            </CardTitle>
            <CardDescription>استخدم كلمة مرور قوية لا تستخدمها في مواقع أخرى</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} noValidate className="space-y-4">
              <Input
                label="كلمة المرور الحالية"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                label="كلمة المرور الجديدة"
                type="password"
                placeholder="8 أحرف على الأقل"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <Input
                label="تأكيد كلمة المرور الجديدة"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {changePwdError && (
                <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 rounded-lg px-3 py-2">{changePwdError}</p>
              )}
              {changePwdSuccess && (
                <p className="text-sm text-[var(--primary)] bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2">تم تغيير كلمة المرور بنجاح</p>
              )}
              <Button
                type="submit"
                variant="primary"
                loading={changePwdLoading}
                disabled={!oldPassword || !newPassword || !confirmPassword}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
              >
                تغيير كلمة المرور
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--destructive)]/20">
          <CardHeader>
            <CardTitle className="text-[var(--destructive)] flex items-center gap-2">
              <span>⚠️</span> منطقة خطرة
            </CardTitle>
            <CardDescription>إجراءات خطرة على حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between p-4 rounded-xl bg-[var(--destructive)]/8 border border-[var(--destructive)]/20">
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--destructive)]">حذف الحساب</h3>
                <p className="text-[var(--destructive)]/70 text-sm mt-0.5">طلب حذف حسابك بشكل نهائي</p>
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

        <Modal open={showRevokeAllModal} onClose={() => setShowRevokeAllModal(false)} title="إلغاء جميع الجلسات">
          <div className="space-y-4">
            <p className="text-sm text-[var(--primary)]">هل أنت متأكد من إلغاء جميع الجلسات الأخرى؟ ستحتاج إلى تسجيل الدخول من جديد على الأجهزة الأخرى.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowRevokeAllModal(false)} className="flex-1 text-[var(--primary)]">إلغاء</Button>
              <Button variant="danger" onClick={handleRevokeAllSessions} loading={revoking === 'all'} className="flex-1">تأكيد</Button>
            </div>
          </div>
        </Modal>

        <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletePassword(''); }} title="حذف الحساب">
          <div className="space-y-4">
            <p className="text-sm text-[var(--primary)]">
              هل أنت متأكد من طلب حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="p-3 rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)] text-sm">
              ⚠️ سيتم حذف جميع منشوراتك، صورك، رسائلك، وصدقائك نهائياً
            </div>
            <Input
              label="كلمة المرور للتأكيد"
              type="password"
              placeholder="أدخل كلمة مرورك الحالية"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} className="flex-1 text-[var(--primary)]">
                إلغاء
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={deleteLoading}
                disabled={!deletePassword.trim()}
                className="flex-1"
              >
                تأكيد الحذف
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}