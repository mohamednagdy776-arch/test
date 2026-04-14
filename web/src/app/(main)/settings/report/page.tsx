'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const ISSUE_TYPES = [
  { value: 'bug', label: 'خطأ تقني', icon: '🐛', color: 'bg-red-100' },
  { value: 'feature', label: 'اقتراح ميزة', icon: '💡', color: 'bg-amber-100' },
  { value: 'account', label: 'مشكلة في الحساب', icon: '👤', color: 'bg-blue-100' },
  { value: 'privacy', label: 'مشكلة في الخصوصية', icon: '🔒', color: 'bg-purple-100' },
  { value: 'other', label: 'أخرى', icon: '📝', color: 'bg-emerald-100' },
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
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
            <span>←</span> <span>العودة للإعدادات</span>
          </Link>

          <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-emerald-900 mb-2">تم إرسال البلاغ بنجاح</h2>
              <p className="text-emerald-700/70 mb-6">شكراً لك، سنراجع البلاغ ونعود إليك قريباً</p>
              <Button variant="primary" onClick={() => { setSubmitted(false); setIssueType(''); setDescription(''); setEmail(''); }} className="bg-emerald-600 hover:bg-emerald-700">
                إرسال بلاغ جديد
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">الإبلاغ عن مشكلة</h1>
          <p className="text-emerald-700/70 mt-2">أخبرنا عن المشكلة التي تواجهها</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
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
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-100'
                      : 'border-emerald-200/50 bg-white/50 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center text-xl`}>
                      {type.icon}
                    </span>
                    <span className="font-semibold text-emerald-900">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>📝</span> التفاصيل
            </CardTitle>
            <CardDescription>اشرح المشكلة بالتفصيل</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">البريد الإلكتروني (اختياري)</label>
                <Input
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-1">وصف المشكلة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white/80 text-emerald-900 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="اشرح بالتفصيل ما المشكلة التي تواجهها..."
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={sending}
                disabled={!issueType || !description.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
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