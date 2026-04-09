'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const ISSUE_TYPES = [
  { value: 'bug', label: 'خطأ تقني' },
  { value: 'feature', label: 'اقتراح ميزة' },
  { value: 'account', label: 'مشكلة في الحساب' },
  { value: 'privacy', label: 'مشكلة في الخصوصية' },
  { value: 'other', label: 'أخرى' },
];

export default function ReportPage() {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!issueType || !description.trim()) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setSending(false);
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
            ← الإعدادات
          </Link>
        </div>

        <Card variant="warm">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-[#213448] mb-2">تم إرسال البلاغ بنجاح</h2>
            <p className="text-[#547792] mb-6">شكراً لك، سنراجع البلاغ ونعود إليك قريباً</p>
            <Button variant="primary" onClick={() => { setSubmitted(false); setIssueType(''); setDescription(''); setEmail(''); }}>
              إرسال بلاغ جديد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
          ← الإعدادات
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#213448]">الإبلاغ عن مشكلة</h1>
        <p className="text-sm text-[#547792] mt-1">أخبرنا عن المشكلة التي تواجهها</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🐛</span> نوع المشكلة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ISSUE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setIssueType(type.value)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  issueType === type.value
                    ? 'border-[#4A8C6F] bg-[#4A8C6F]/10'
                    : 'border-[#C8D8DF]/60 bg-[#FDFAF5] hover:border-[#547792]/40'
                }`}
              >
                <span className="font-semibold text-[#213448]">{type.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>📝</span> التفاصيل
          </CardTitle>
          <CardDescription>اشرح المشكلة بالتفصيل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">البريد الإلكتروني (اختياري)</label>
              <Input
                placeholder="أدخل بريدك الإلكتروني إذا كنت تريد أن نعود إليك"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">وصف المشكلة</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-[#C8D8DF] bg-white text-[#213448] focus:outline-none focus:border-[#547792]"
                placeholder="اشرح بالتفصيل ما المشكلة التي تواجهها..."
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={sending}
              disabled={!issueType || !description.trim()}
              className="w-full"
            >
              إرسال البلاغ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}