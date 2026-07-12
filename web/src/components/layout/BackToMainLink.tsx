'use client';
import Link from 'next/link';
import { getCurrentUserId } from '@/lib/socket-client';

// Always linked to the public landing page ("/"), even for signed-in users
// navigating here from inside the app (e.g. Help > Terms) -- they'd expect
// to land back on the dashboard, not be bounced out to the marketing page
// they never see once logged in (#213).
export function BackToMainLink() {
  const isAuthed = !!getCurrentUserId();
  return (
    <Link href={isAuthed ? '/dashboard' : '/'} className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>
      ← العودة للرئيسية
    </Link>
  );
}
