'use client';
import { ProfileView } from '@/features/profile/components/ProfileView';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  return <ProfileView userId={params.id} />;
}
