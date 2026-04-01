import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/store/providers';

export const metadata: Metadata = {
  title: {
    default: 'Tayyibt Admin',
    template: '%s | Tayyibt Admin',
  },
  description: 'Tayyibt platform administration dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
