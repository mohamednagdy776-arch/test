'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const ISSUE_TYPES = [
  { value: 'bug', label: 'خطأ تقني', icon: '🐛', color: 'bg-[var(--destructive)]/15' },
  { value: 'feature', label: 'اقتراح ميزة', icon: '💡', color: 'bg-[var(--accent)]/15' },
  { value: 'account', label: 'مشكلة في الحساب', icon: '👤', color: 'bg-blue-100' },
  { value: 'privacy', label: 'مشكلة في الخصوصية', icon: '🔒', color: 'bg-purple-100' },
  { value: 'other', label: 'أخرى', icon: '📝', color: 'bg-[var(--muted)]' },
];

export default function ReportPage() {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (i: number) => setAttachments((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!issueType || !description.trim()) return;
    setSending(true);
    try {
      const { apiClient } = await import('@/lib/api-client');
      if (attachments.length > 0) {
        const form = new FormData();
        form.append('type', issueType);
        form.append('description', description.trim());
        if (email.trim()) form.append('email', email.trim());
        attachments.forEach((f) => form.append('attachments', f));
        await apiClient.post('/support/report', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await apiClient.post('/support/report', {
          type: issueType,
          description: description.trim(),
          email: email.trim() || undefined,
        });
      }
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'فشل إرسال البلاغ. يرجى المحاولة مجدداً.';
      showToast(msg, 'error');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link href="/settings" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
            <span>←</span> <span>العودة للإعدادات</span>
          </Link>

          <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">تم إرسال البلاغ بنجاح</h2>
              <p className="text-[var(--primary)]/70 mb-6">شكراً لك، سنراجع البلاغ ونعود إليك قريباً</p>
              <Button variant="primary" onClick={() => { setSubmitted(false); setIssueType(''); setDescription(''); setEmail(''); }} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                إرسال بلاغ جديد
              </Button>
            </CardContent>
          </Card>
        </div>
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
          <h1 className="text-3xl font-bold text-[var(--foreground)]">الإبلاغ عن مشكلة</h1>
          <p className="text-[var(--primary)]/70 mt-2">أخبرنا عن المشكلة التي تواجهها</p>
        </div>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>🐛</span> نوع المشكلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ISSUE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setIssueType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    issueType === type.value
                      ? 'border-[var(--ring)] bg-[var(--muted)]/80 shadow-lg shadow-black/5'
                      : 'border-[var(--border)]/50 bg-[var(--card)]/50 hover:border-[var(--border)] hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center text-xl`}>
                      {type.icon}
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-[var(--card)] backdrop-blur-sm border-[var(--border)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <span>📝</span> التفاصيل
            </CardTitle>
            <CardDescription>اشرح المشكلة بالتفصيل</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">البريد الإلكتروني (اختياري)</label>
                <Input
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">وصف المشكلة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--muted)] transition-all"
                  placeholder="اشرح بالتفصيل ما المشكلة التي تواجهها..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">لقطات شاشة أو ملفات (اختياري، حتى 3)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= 3}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--primary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                >
                  📎 إضافة ملف أو لقطة شاشة
                </button>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--muted)] border border-[var(--border)] px-3 py-2 text-sm">
                        <span className="text-[var(--foreground)] truncate">{f.name}</span>
                        <button onClick={() => removeAttachment(i)} className="text-[var(--destructive)]/70 hover:text-[var(--destructive)] mr-2 shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={sending}
                disabled={!issueType || !description.trim()}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
              >
                إرسال البلاغ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}