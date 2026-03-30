import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/store/providers';

export const metadata: Metadata = {
  title: 'Tayyibt',
  description: 'AI-powered matchmaking platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
