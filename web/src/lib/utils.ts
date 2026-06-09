import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolve a human display name for a user-like object.
 * Priority: firstName + lastName → profile.fullName → fullName.
 * The email/username is NEVER used as the visible name (only a last-resort label).
 * Handles shapes: User, Profile, { user: User }, { userId: User }.
 */
export function displayName(entity: any): string {
  if (!entity) return 'مستخدم';
  // Unwrap common nesting shapes
  const u =
    entity.user && typeof entity.user === 'object' ? entity.user :
    entity.userId && typeof entity.userId === 'object' ? entity.userId :
    entity;

  const first = u.firstName ?? entity.firstName;
  const last = u.lastName ?? entity.lastName;
  const fromName = `${first ?? ''} ${last ?? ''}`.trim();
  if (fromName) return fromName;

  const fromProfile = u.profile?.fullName || u.fullName || entity.profile?.fullName || entity.fullName;
  if (fromProfile && String(fromProfile).trim()) return String(fromProfile).trim();

  return 'مستخدم';
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  
  return date.toLocaleDateString('ar-SA');
}
