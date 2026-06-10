import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex gap-6">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-[5.5rem]"><Sidebar /></div>
            </aside>
            <main className="flex-1 min-w-0 animate-fade-in">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
