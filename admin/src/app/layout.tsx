import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/store/providers';

export const metadata: Metadata = {
  title: 'Tayyibt Admin',
  description: 'Tayyibt platform admin dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
