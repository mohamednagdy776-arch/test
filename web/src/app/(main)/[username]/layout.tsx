import type { Metadata } from 'next';

// Server-side OG metadata for a user's profile so social shares preview the
// user's real name/photo instead of the site placeholder (#400). Uses the
// unauthenticated /public/profile endpoint (crawlers have no session).
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const ORIGIN = API.replace(/\/api\/v1\/?$/, '');

const abs = (u?: string | null) => (u ? (/^https?:\/\//.test(u) ? u : `${ORIGIN}${u}`) : undefined);

async function fetchOg(username: string) {
  try {
    const res = await fetch(`${API}/public/profile/${encodeURIComponent(username)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const p = await fetchOg(params.username);
  if (!p) return {};
  const name = p.fullName || p.username || 'مستخدم طيبت';
  const description = p.bio || `الملف الشخصي لـ ${name} على طيبت`;
  const image = abs(p.coverUrl) || abs(p.avatarUrl);
  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      type: 'profile',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
