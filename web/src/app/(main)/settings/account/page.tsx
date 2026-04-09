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
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
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
        <h1 className="text-2xl font-bold text-[#213448]">معلومات الحساب</h1>
        <p className="text-sm text-[#547792] mt-1">عرض وتعديل معلومات حسابك الشخصية</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>👤</span> الملف الشخصي
          </CardTitle>
          <CardDescription>معلومات ملفك الشخصي التي يراها الآخرون</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#D4E8EE] flex items-center justify-center text-3xl font-bold text-[#213448]">
                {profile?.name?.charAt(0) || '?'}
              </div>
              <div>
                <Button variant="outline" size="sm">
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
                <label className="block text-sm font-medium text-[#213448] mb-1">النبذة</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!editing}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-[#C8D8DF] bg-white text-[#213448] focus:outline-none focus:border-[#547792] disabled:bg-gray-50"
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
                  <Button variant="ghost" onClick={() => { setEditing(false); fetchProfile(); }}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleSave} loading={saving}>
                    حفظ التغييرات
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setEditing(true)}>
                  تعديل الملف الشخصي
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>📧</span> معلومات الاتصال
          </CardTitle>
          <CardDescription>معلومات حسابك الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
              <div>
                <p className="font-semibold text-[#213448]">البريد الإلكتروني</p>
                <p className="text-sm text-[#547792]">{profile?.email || '-'}</p>
              </div>
              <Button variant="ghost" size="sm">
                تغيير
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
              <div>
                <p className="font-semibold text-[#213448]">رقم الهاتف</p>
                <p className="text-sm text-[#547792]">{profile?.phone || 'لم يُضف'}</p>
              </div>
              <Button variant="ghost" size="sm">
                تغيير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>📅</span> معلومات الحساب
          </CardTitle>
          <CardDescription>تفاصيل حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
              <div>
                <p className="font-semibold text-[#213448]">تاريخ الانضمام</p>
                <p className="text-sm text-[#547792]">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-SA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
              <div>
                <p className="font-semibold text-[#213448]">آخر نشاط</p>
                <p className="text-sm text-[#547792]">
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
  );
}