import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/store/providers';
import { UnderConstructionBanner } from '@/components/layout/UnderConstructionBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://145-14-158-100.sslip.io'),
  title: {
    default: 'طيبت — منصة التوافق الذكي والزواج الإسلامي',
    template: '%s | طيبت',
  },
  description:
    'طيبت منصة ذكية للتعارف والزواج للمسلمين حول العالم، تعتمد على الذكاء الاصطناعي لإيجاد التوافق الديني والحياتي بطريقة حلال وآمنة. Tayyibt is an AI-powered Muslim matchmaking platform.',
  keywords: ['زواج', 'تعارف', 'مسلمين', 'توافق', 'Muslim matchmaking', 'marriage', 'Tayyibt', 'طيبت'],
  openGraph: {
    title: 'طيبت — منصة التوافق الذكي والزواج الإسلامي',
    description: 'منصة ذكية للتعارف والزواج للمسلمين تعتمد على الذكاء الاصطناعي.',
    type: 'website',
    locale: 'ar_AR',
    siteName: 'طيبت',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <UnderConstructionBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
