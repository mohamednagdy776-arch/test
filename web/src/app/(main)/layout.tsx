import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div data-theme="luxury" className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <OfflineBanner />
        <Navbar />
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-5">
          <div className="flex gap-5">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-[4.5rem]"><Sidebar /></div>
            </aside>
            <main className="flex-1 min-w-0 animate-fade-in">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
