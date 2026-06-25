import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'البريد الإلكتروني' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
