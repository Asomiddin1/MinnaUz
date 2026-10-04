'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { GlobalSearchModal } from '@/components/dashboard/global-search-modal';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';

import { DashboardTabProvider } from '@/components/dashboard/tab-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileSidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${lang}/auth/login`);
    }
  }, [isLoading, isAuthenticated, lang, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[13px] text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardTabProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar (Desktop persistent + Mobile slide drawer) */}
        <DashboardSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          onSearchOpen={() => setIsSearchModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Sticky Header with Hamburger trigger */}
          <DashboardHeader
            onMenuClick={() => setMobileSidebarOpen(true)}
            onSearchOpen={() => setIsSearchModalOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1240px]">
              {children}
            </div>
          </main>
        </div>
      </div>
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </DashboardTabProvider>
  );
}