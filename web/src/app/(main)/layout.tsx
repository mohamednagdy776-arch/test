import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { CallProvider } from '@/features/call/CallProvider';
import { ChatRealtime } from '@/features/chat/ChatRealtime';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CallProvider>
      {/* No hard-coded data-theme here: a data-theme on this wrapper would redefine
          every color CSS variable for all descendants and override the theme the
          user picks in Settings → Appearance (which ThemeProvider applies on <html>).
          Leave it unset so the selected theme actually cascades in (#48). */}
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      >
        <OfflineBanner />
        {/* Establishes the global Socket.IO connection + newMessageNotification
            listener for every logged-in user -- the import existed but this
            element was never mounted, so no socket ever connected until a user
            opened /chat, meaning no toast/badge fired for messages received
            anywhere else on the site (#307). */}
        <ChatRealtime />
        <Navbar />

        {/* Content area — max-w-screen-2xl fills wide monitors; pb-20 clears the mobile bottom nav */}
        <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-5 lg:px-8 py-5 pb-24 lg:pb-8">
          <div className="flex gap-5 lg:gap-6">
            {/* Sidebar — only visible on lg+ */}
            <aside className="hidden w-60 xl:w-64 shrink-0 lg:block">
              <div className="sticky top-[4.5rem]">
                <Sidebar />
              </div>
            </aside>

            {/* Main content — always fills remaining space */}
            <main className="flex-1 min-w-0 animate-fade-in">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile / tablet bottom navigation — hidden on lg+ */}
        <BottomNav />
      </div>
      </CallProvider>
    </AuthGuard>
  );
}
