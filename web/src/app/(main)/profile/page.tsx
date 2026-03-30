'use client';
import { ProfileView } from '@/features/profile/components/ProfileView';

export default function ProfilePage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">الملف الشخصي</h1>
      <ProfileView />
    </div>
  );
}
