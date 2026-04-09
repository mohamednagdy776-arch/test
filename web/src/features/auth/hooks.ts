'use client';

import { useState, useCallback } from 'react';
import { authApi } from './api';
import { profileApi } from '@/features/profile/api';

interface Session {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  isActive: boolean;
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.getSessions();
      setSessions(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب الجلسات');
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إلغاء الجلسة');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeAllSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authApi.revokeAllSessions();
      setSessions(prev => prev.filter(s => s.isActive));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إلغاء جميع الجلسات');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    revokeSession,
    revokeAllSessions,
  };
}

export function useTwoFactor() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileApi.getMyProfile();
      setEnabled(response.data?.twoFactorEnabled || false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب حالة التحقق');
    } finally {
      setLoading(false);
    }
  }, []);

  const setup2FA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.setup2FA();
      setSetupData({
        qrCode: response.data.qrCode || '',
        secret: response.data.secret || '',
      });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إعداد التحقق');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyAndEnable2FA = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.verify2FA(code);
      setEnabled(true);
      setSetupData(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'رمز التحقق غير صحيح');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const disable2FA = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.disable2FA(code);
      setEnabled(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إلغاء التحقق');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    enabled,
    loading,
    error,
    setupData,
    fetchStatus,
    setup2FA,
    verifyAndEnable2FA,
    disable2FA,
  };
}