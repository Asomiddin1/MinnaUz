'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/${lang}/auth/login`);
      }
    }
  }, [isLoading, isAuthenticated, lang, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[13px] text-muted-foreground">Admin panel yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-lg">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive text-2xl mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="headline text-[22px] font-bold text-foreground">
            Ruxsat berilmagan
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
            Admin panelga kirish faqat <strong>Admin</strong> yoki <strong>Super Admin</strong> huquqiga ega foydalanuvchilar uchun ruxsat etilgan.
          </p>
          <div className="mt-6">
            <Link
              href={`/${lang}/dashboard`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Oʻquvchi paneliga qaytish</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
