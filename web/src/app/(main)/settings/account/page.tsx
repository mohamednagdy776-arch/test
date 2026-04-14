'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { profileApi } from '@/features/profile/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileApi.getMyProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        username: res.data.username || '',
        bio: res.data.bio || '',
        location: res.data.location || '',
        website: res.data.website || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.updateProfile(formData);
      setProfile((prev: any) => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 flex justify-center items-center">
        <Spinner size="lg" />
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
          <h1 className="text-3xl font-bold text-emerald-900">معلومات الحساب</h1>
          <p className="text-emerald-700/70 mt-2">عرض وتعديل معلومات حسابك</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>👤</span> الملف الشخصي
            </CardTitle>
            <CardDescription>معلومات ملفك الشخصي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-3xl font-bold text-emerald-700 shadow-inner">
                  {profile?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                    تغيير الصورة
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <Input
                  label="الاسم"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                />
                <Input
                  label="اسم المستخدم"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!editing}
                />
                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-1">النبذة</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white/80 text-emerald-900 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-emerald-50/50 transition-all"
                    placeholder="اكتب نبذة عن نفسك..."
                  />
                </div>
                <Input
                  label="الموقع"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!editing}
                  placeholder="المدينة، الدولة"
                />
                <Input
                  label="الموقع الإلكتروني"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  disabled={!editing}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-3">
                {editing ? (
                  <>
                    <Button variant="ghost" onClick={() => { setEditing(false); fetchProfile(); }} className="text-emerald-700">
                      إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={saving} className="bg-emerald-600 hover:bg-emerald-700">
                      حفظ التغييرات
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => setEditing(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    تعديل الملف الشخصي
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>📧</span> معلومات الاتصال
            </CardTitle>
            <CardDescription>معلومات حسابك الأساسية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <div>
                  <p className="font-semibold text-emerald-900">البريد الإلكتروني</p>
                  <p className="text-emerald-700/70 text-sm">{profile?.email || '-'}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-800">
                  تغيير
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <div>
                  <p className="font-semibold text-emerald-900">رقم الهاتف</p>
                  <p className="text-emerald-700/70 text-sm">{profile?.phone || 'لم يُضف'}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-800">
                  تغيير
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>📅</span> معلومات الحساب
            </CardTitle>
            <CardDescription>تفاصيل حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <div>
                  <p className="font-semibold text-emerald-900">تاريخ الانضمام</p>
                  <p className="text-emerald-700/70 text-sm">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-SA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                <div>
                  <p className="font-semibold text-emerald-900">آخر نشاط</p>
                  <p className="text-emerald-700/70 text-sm">
                    {profile?.lastActive ? new Date(profile.lastActive).toLocaleDateString('ar-SA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}